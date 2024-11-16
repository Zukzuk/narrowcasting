const AppApi = require('../interfaces/api/AppApi');
const VersionReadModel = require('../interfaces/readModels/VersionReadModel');

class AppBFF {
    constructor() {
        // read models
        this.versionReadModel = new VersionReadModel();
    }

    bootstrap(server, path) {
        // bootstrap
        this.#useApi(server, path);
        this.#setupListeners();
        this.#initialCommands();
    }

    #useApi(server, path) {
        // read model and router orchestration
        server.use(path, AppApi({ 
            versionReadModel: this.versionReadModel,
        }));
    }

    #setupListeners() {

    }

    #initialCommands() {

    }

}

module.exports = AppBFF;