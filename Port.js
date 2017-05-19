const portfinder = require('portfinder');

class Port {
  constructor(port, project) {
    this._port = port;
    this._project = project;
    this._usableCache = void 0;

    this._usable().then((usable) => this._usableCache = usable);
  }

  free() {
    this._project = void 0;
    this._updateUsableCache();
  }

  get number() {
    return this._port;
  }

  get project() {
    return this._project;
  }

  set project(project) {
    // Two way assign
    if (!project.port) {
      this._project = project;
      project.port = this;
    }
    this._updateUsableCache();
  }

  /**
   * Return lastest port check result.
   * @return {Boolean}
   */
  get usableCache() {
    return this._usableCache;
  }

  /**
   * If this port is non-occuppied and no project use this port.
   * @return {Promise.<Boolean, Error>}
   */
  get usable() {
    return this._usable();
  }

  /**
   * If this port is non-occuppied.
   * @return {Promise.<Boolean, Error>}
   */
  get isOccuppied() {
    return this._isOccuppied();
  }

  async _usable() {
    return this._usableCache = !(await this._isOccuppied()) && (!this._project);
  }

  async _isOccuppied() {
    const
      portNumber = await portfinder.getPortPromise({
        port: this._port
      }),
      isOccuppied = (portNumber !== this._port);

    // update usableCache
    this._usableCache = !isOccuppied && !this._project;

    return isOccuppied;
  }

  /**
   * @private
   * @return {Promise.<Boolean, Error>}
   */
  async _updateUsableCache() {
    return this._usableCache = !(await this._isOccuppied()) && (!this._project);
  }
}

module.exports = Port;
