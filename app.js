require('json5/lib/require'); // Override "require" function. Make "require" can load json5 format.

const
  fs = require('fs'),
  URL = require('url'),
  express = require('express'),
  bodyParser = require('body-parser'),
  Configstore = require('configstore'),
  basicAuth = require('express-basic-auth'),

  Project = require('./Project'),
  Port = require('./Port'),
  defaultConfig = require('./config/default.json5'),
  pkg = require('./package.json'),

  config = new Configstore(pkg.name, defaultConfig),
  app = express(),

  isHttps = !!config.get('ssl') || false,
  TIMEOUT_TIME = config.get('limitTime') || 5000, // limit runC9 time.
  ports = [],
  projects = [],
  c9s = [];

/* Initial config */
const defaultPorts = config.get('ports') || [];
defaultPorts.forEach((portNumber) => ports.push(new Port(portNumber)));
const defaultProject = config.get('projects') || [];
defaultProject.forEach((project) => projects.push(new Project(project)));
Project.TIMEOUT_TIME = TIMEOUT_TIME;

app.set('view engine', 'ejs');

/* Basic auth */
const authConfig = {};
authConfig[config.get('account')] = config.get('password');
app.use(basicAuth({
  users: authConfig,
  challenge: true,
  realm: 'Cloud9 Launcher'
}));

/* Static */
app.use('/assets', express.static('assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

/* Router */
app.get('/', function(req, res) {
  res.render('index', {
    projects: projects,
    url: `http${(isHttps)?'s':''}:\/\/${config.get('c9Host')}`
  });
});

app.get('/setting', function(req, res) {
  res.render('setting', {
    ports: ports
  });
});

const api = express.Router();

api.route('/launch') // used to open or close process
  .post(async function(req, res) {
    const targetProjectName = req.body.target;
    const project = getProject(targetProjectName);

    if (!project)
      return res.status(404).send({
        error: {
          message: 'Cannot find the project by name.'
        }
      });

    // If the project is active, exit.
    if (project.isActive)
      return res.status(403).send({
        error: {
          message: 'The project is running on port ' + project.port.number + '.',
          data: {
            port: project.port.number
          }
        }
      });

    // Find a free port and assign to target project.
    const port = await getFreePort();

    if (!port)
      return res.status(404).send({
        error: {
          message: 'No free port. Please add or release some free ports.'
        }
      });

    try {
      const runPortNumber = await project.start(port);
      console.info(`Project "${project.name}" is running. Use port ${runPortNumber}.`);
      res.send({
        succsess: {
          data: {
            port: runPortNumber
          }
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(403).send(err);
    }
  })
  .delete(function(req, res) {
    const targetProjectName = req.body.target;
    const project = getProject(targetProjectName);

    if (!project)
      return res.status(404).send({
        error: {
          message: 'Cannot find the project by name.'
        }
      });

    // If the project is active, exit.
    if (!project.isActive)
      return res.status(403).send({
        error: {
          message: 'The project is not running.'
        }
      });

    const
      usedPort = project.port.number,
      result = project.stop();
    console.info(`Project "${project.name}" is shutdown. Port ${usedPort} is free.`);
    if (result)
      return res.send({
        success: true
      });
    else
      return res.status(403).send({
        error: {
          message: 'The project is not running.'
        }
      });
  });

api.route('/project') // used to add, edit or delete project setting.
  .post(function(req, res) {
    const
      projectName = req.body.name,
      path = req.body.path;
    if (!projectName || !path)
      return res.status(403).send({
        error: {
          message: 'Lack of arguments.'
        }
      });

    const project = new Project({
      name: projectName,
      path: path
    });

    projects.push(project);

    updateProjectsConfig();

    return res.send({
      success: true
    });
  })
  .put(function(req, res) {
    const
      targetProjectName = req.body.name,
      path = req.body.path;

    const project = getProject(targetProjectName);
    if (!project)
      return res.status(403).send({
        error: {
          message: 'Cannot find the project by name'
        }
      });
    project.path = path;

    updateProjectsConfig();

    if (project.isActive)
      return res.send({
        success: {
          message: 'Success but it\'s effective in next launch.'
        }
      });
    else
      return res.send({
        success: true
      });
  })
  .delete(function(req, res) {
    const targetProjectName = req.body.name;

    const project = popProject(targetProjectName);
    if (!project)
      return res.status(404).send({
        error: {
          message: 'Cannot find the project by name'
        }
      });

    updateProjectsConfig();

    res.send({
      success: true
    });
  });

api.route('/port') // used to add or delete port setting
  .post(async function(req, res) {
    let portNumber = Number(req.body.number);

    if (!portNumber || portNumber === 0)
      return res.status(403).send({
        error: {
          message: 'Lack of port number.'
        }
      });

    const port = new Port(portNumber);

    if (ports.find((portNum) => portNum === portNumber))
      return res.status(403).send({
        error: {
          message: 'Already has same port in ports list.'
        }
      });

    ports.push(port);

    updatePortsConfig();

    return res.send({
      success: true
    });
  })
  .delete(function(req, res) {
    const portNumber = req.body.number;

    const port = popPort(portNumber);
    if (!port)
      return res.status(404).send({
        error: {
          message: 'Cannot find the port by port number.'
        }
      });

    updatePortsConfig();

    res.send({
      success: true
    });
  });

app.use('/api', api);

// Launch UI server
const
  sslConfig = config.get('ssl'),
  port = config.get('port') || 8080;
if (isHttps) {
  const option = {};
  for (let k in sslConfig) {
    if (fs.existsSync(sslConfig[k]))
      option[k] = fs.readFileSync(sslConfig[k]);
    else
      console.warn('Config: property of ' + k + ' is not a correct path.');
  }

  require('https')
    .createServer(option, app)
    .listen(port, function() {
      console.info('UI server listening on port ' + port);
    });
} else
  app.listen(port, function() {
    console.info('UI server listening on port ' + port);
  });

process.on('exit', function() {
  c9s.forEach((c9) => {
    if (c9 && c9.pid && !c9.killed) {
      process.kill(c9.pid);
      console.info('c9 killed');
    }
  });
});

// Return a free port.
/* TODO: change to port.usable. */
function getFreePort() {
  return ports.find((port) => port.usableCache);
}

// Use project name to find out project.
function getProject(name) {
  return projects.find((project) => project.name === name);
}

function popProject(name) {
  const index = projects.findIndex((project) => project.name === name);
  // If cannot find the project, return false.
  if (!index)
    return false;

  // Remove project from array projects, and return this project.
  const project = projects[index];
  projects.splice(index, 1);
  return project;
}

function popPort(number) {
  const index = ports.findIndex((port) => port.number === number);
  // If cannot find the port, return false.
  if (!index)
    return false;

  // Remove port from array ports, and return this port.
  const port = ports[index];
  ports.splice(index, 1);
  return port;
}

// save projects to config file.
function updateProjectsConfig() {
  config.set('projects', projects.map((project) => {
    return {
      name: project.name,
      path: project.path
    };
  }));
}

// save ports to config file.
function updatePortsConfig() {
  config.set('ports', ports.map((port) => port.number));
}
