const
	fs = require('fs'),
	URL = require('url'),
	express = require('express'),
	bodyParser = require('body-parser'),
	spawn = require('child_process').spawn,
	config = require('config'),
	Project = require('./Project'),
	Port = require('./Port'),
	app = express(),
	proc = cmd();

const
	TIMEOUT_TIME = config.get('limitTime') || 5000, // limit runC9 time.
	ports = [],
	projects = [],
	c9s = [];
	
// Initial config
const defaultPorts = config.get('ports') || [];
defaultPorts.forEach((portNumber) => ports.push(new Port(portNumber)));
const defaultProject = config.get('projects') || [];
defaultProject.forEach((project) => projects.push(new Project(project)));

app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.get('/', function(req, res) {
	res.render('index', {
		projects: projects,
	});
});

app.get('/setting', function(req, res) {
	res.render('setting', {
		ports: ports,
	});
});

const api = express.Router();

api.route('/launch')
	.post(function(req, res) {
		const targetProjectName = req.body.target;
		const project = getProject(targetProjectName);
		
		if(!project)
			return res.status(403).send({	error: { 
				message: 'Cannot find the project by name' 
			} });

		// If the project is active, exit.
		if (project.isActive)
			return res.status(403).send({	error: {
					message: 'The project is running on port ' + project.port.number,
					data: {	port: project.port.number	}
				}	});

		// Find a free port and assign to target project.
		const port = getFreePort();
		if(!port)
			return res.status(403).send({	error: 
				{ message: 'No free port. Please add some free ports.' } 
			});

		runC9(port, project)
			.then(() => {
				project.port = port; // two way assign
				res.send({ succsess: { data: { port: port.number } } });
			})
			.catch((err) => {
				console.error(err);
				return res.status(403).send(err);
			});
	})
	.delete(function(req, res) {
		const targetProjectName = req.body.target;
		const project = getProject(targetProjectName);
		
		if(!project)
			return res.status(404).send({	error: { 
				message: 'Cannot find the project by name' 
			} });

		// If the project is active, exit.
		if (!project.isActive)
			return res.status(403).send({	error: {
				message: 'The project is not running.'
			}	});
			
		const result = project.killC9();
		if(result)
			return res.send({ success: true });
		else
			return res.status(403).send({	error: {
				message: 'The project is not running.'
			}	});
	});

api.route('/project')
	.post(function(req, res) {
		const 
			projectName = req.body.name,
			path = req.body.path;
		if(!projectName || !path)
			return res.status(403).send({	error: { message: 'Lack of arguments.' } });

		const project = new Project({
			name: projectName,
			path: path
		});
		
		projects.push(project);
		
		return res.send({ success: true });
	})
	.put(function(req, res) {
		const 
			targetProjectName = req.body.name,
			path = req.body.path;
			
		const project = getProject(targetProjectName);
		if(!project)
			return res.status(403).send({	error: { 
				message: 'Cannot find the project by name' 
			} });
		project.path = path;
		
		if(project.isActive)
			return res.send({ success: { 
				message: 'Success but it\'s effective in next launch.' 
			} });
		else
			return res.send({ success: true });
	})
	.delete(function(req, res) {
		const targetProjectName = req.body.name;
		
		const project = popProject(targetProjectName);
		if(!project)
			return res.status(404).send({	error: { 
				message: 'Cannot find the project by name' 
			} });
			
		res.send({ success: true });
	});
	
api.route('/port')
	.post(function(req, res) {
		const portNumber = req.body.number;
		if(!portNumber)
			return res.status(403).send({	error: { message: 'Lack of port number.' } });

		const port = new Port(portNumber);
		
		ports.push(port);
		
		return res.send({ success: true });
	})
	.delete(function(req, res) {
		const portNumber = req.body.number;
		
		const port = popPort(portNumber);
		if(!port)
			return res.status(404).send({	error: { 
				message: 'Cannot find the port by port number.' 
			} });
			
		res.send({ success: true });
	});
	
app.use('/api', api);

// Launch server
const 
	sslConfig = config.get('ssl'),
	port = config.get('port') || 8080;
if(sslConfig) {
	const option = {};
	for(let k in sslConfig)
		option[k] = fs.readFileSync(sslConfig[k]);
		
	require('https')
	.createServer(option, app)
	.listen(port, function() {
		console.log('Listening on port ' + port);
	});
} else 
  app.listen(port, function() {
		console.log('Listening on port ' + port);
	});

process.on('exit', function() {
	c9s.forEach((c9) => {
		if (c9 && c9.pid && !c9.killed) {
			process.kill(c9.pid);
			console.log("c9 killed");
		}
	});
});

// Return a free port.
function getFreePort() {
	return ports.find((port) => port.isFree);
}

// Spawn a C9 process.
function runC9(port, project) {
	return new Promise((resolve, reject) => {
		// If over time we set, throw a error.
		setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_TIME);
		
		const workspace = project.path;
		if(!workspace)
			throw new Error('Cannot found workspace.')
			
		const runPort = port.number;
		if(!runPort)
			throw new Error('Cannot found port number.')

		const 
			script = `node /root/c9sdk/server.js -p ${runPort} -w ${workspace}  -a ${config.get('account')}:${config.get('password')}`,
			c9 = proc.run(script, {
				env: process.env
			},
			function(stderr, stdout, code, signal) {
				env: process.env
			},
			function(stderr, stdout, code, signal) {
				console.log("c9s died with", code, signal);
			});

		c9.stdout.on('data', function(data) {
			const stdout = data.toString();
			if (stdout.indexOf("Cloud9 is up and running") !== -1) {
				console.log('Cloud9 is up and running on ' + runPort);
				resolve(runPort);
			}
		});

		project.c9 = c9;
		project.port = port;
	});
}

function cmd() {
	var command = {};
	command.run = function(commandLine, _options, callback) {
		var options, __undefined__;
		if (!callback && typeof _options === "function") {
			callback = _options;
			options = __undefined__;
		} else if (typeof _options === "object") {
			options = _options;
		}
		var args = commandLine.split(" ");
		var cmd = args[0];
		args.shift();
		var oneoff = spawn(cmd, args, options);
		var stderr, stdout;
		oneoff.stdout.on('data', function(data) {
			stdout = data.toString();
			console.log("stdout", data.toString());
		});
		oneoff.stderr.on('data', function(data) {
			stderr = data.toString();
			console.log("stderr", data.toString());
		});
		oneoff.on('exit', function(code, signal) {
			oneoff.killed = true;
			if (typeof callback === "function") callback(stderr, stdout, code, signal);
		});
		return oneoff;
	};
	return command;
}

function getC9(condition) {
	if (condition.auth)
		return c9s.find((c9) => c9.auth === condition.auth);
	else if (condition.port)
		return c9s.find((c9) => c9.port === condition.port);
}

// Use project name to find out project.
function getProject(name) {
	return projects.find((project) => project.name === name);
}

function popProject(name) {
	const index = projects.findIndex((project) => project.name === name);
	// If cannot find the project, return false.
	if(!index)
		return false;
	
	// Remove project from array projects, and return this project.
	const	project = projects[index];
	projects.splice(index, 1);
	return project;
}

// Use port number to find out port object.
function getPort(number) {
	return ports.find((port) => port.number === number);
}

function popPort(number) {
	const index = ports.findIndex((port) => port.number === number);
	// If cannot find the port, return false.
	if(!index)
		return false;
	
	// Remove port from array ports, and return this port.
	const	port = ports[index];
	ports.splice(index, 1);
	return port;
}
