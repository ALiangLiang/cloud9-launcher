class Project {
  constructor(options) {
    this._name = options.name;
    this._path = options.path;
    this._port = options.port;
    this._c9 = options.c9;
    this._active = false;
  }

  killC9() {
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
