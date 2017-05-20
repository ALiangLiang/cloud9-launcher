const
  spawn = require('child_process').spawn,
  proc = cmd(),
  Configstore = require('configstore'),
  pkg = require('./package.json'),
  defaultConfig = require('./config/default.json5'),
  config = new Configstore(pkg.name, defaultConfig),
  TIMEOUT_TIME = config.get('limitTime') || 5000; // limit runC9 time.

class Project {
  constructor(options) {
    this._name = options.name;
    this._path = options.path;
    this._port = options.port;
    this._c9 = options.c9;
  }

  start(port) {
    return runC9(port, this);
  }

  stop() {
    const c9 = this._c9;
    if (c9 && c9.pid && !c9.killed) {
      try {
        process.kill(c9.pid);
      } catch (err) {
        return false;
      }
      this._port.free();
      this._port = void 0;
      return true;
    } else
      return false;
  }

  get isActive() {
    return !!this._port;
  }

  get name() {
    return this._name;
  }

  set path(path) {
    this._path = path;
  }

  get path() {
    return this._path;
  }

  set port(port) {
    // Two way assign
    if (!port._project) {
      this._port = port;
      port.project = this;
    } else
      console.log('Ths port is not free. Used by project ' + port.project.name);
  }

  get port() {
    return this._port;
  }

  get isActive() {
    return !!this._port;
  }

  set c9(c9) {
    this._c9 = c9;
  }

  get c9() {
    return this._c9;
  }
}

module.exports = Project;

// Spawn a C9 process.
function runC9(port, project) {
  return new Promise((resolve, reject) => {
    // If over time we set, throw a error.
    setTimeout(() => {
      /* TODO: need to check again is this cloud9 up. */
      reject(new Error('TIMEOUT'));
    }, TIMEOUT_TIME);

    const workspace = project.path;
    if (!workspace)
      throw new Error('Cannot found workspace.');

    const runPort = port.number;
    if (!runPort)
      throw new Error('Cannot found port number.');

    const
      script = `node /root/c9sdk/server.js -p ${runPort} -w ${workspace} -l 0.0.0.0 -a ${config.get('account')}:${config.get('password')}`,
      c9 = proc.run(script, {
          env: process.env
        },
        function() {
          env: process.env;
        },
        function(stderr, stdout, code, signal) {
          console.log('c9s died with', code, signal);
        });

    c9.stdout.on('data', function(data) {
      const stdout = data.toString();
      if (stdout.indexOf('Cloud9 is up and running') !== -1) {
        project.c9 = c9;
        project.port = port;
        resolve(runPort);
      }
    });
  });
}

function cmd() {
  var command = {};
  command.run = function(commandLine, _options, callback) {
    var options,
      __undefined__;
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
    var stderr,
      stdout;
    oneoff.stdout.on('data', function(data) {
      stdout = data.toString();
      // console.log("stdout", data.toString());
    });
    oneoff.stderr.on('data', function(data) {
      stderr = data.toString();
      console.log("stderr", data.toString());
    });
    oneoff.on('exit', function(code, signal) {
      oneoff.killed = true;
      if (typeof callback === "function")
        callback(stderr, stdout, code, signal);
    });
    return oneoff;
  };
  return command;
}
