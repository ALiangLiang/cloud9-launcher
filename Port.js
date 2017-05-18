class Port {
    constructor(port, project) {
        this._port = port;
        this._project = project;
    }

    free() {
        this._project = void 0;
    }

    set project(project) {
        this._project = project;
    }

    get project() {
        return this._project;
    }

    get isFree() {
        return !this._project;
    }

    get number() {
        return this._port;
    }

    set project(project) {
        // two way assign
        if (!project.port) {
            this.project = project;
            project.port = this;
        } else
            console.log('Ths project is running on port ' + project.port.number);
    }
}

module.exports = Port;
