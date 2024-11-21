import AppApi from '../interfaces/api/AppApi.js';
import VersionReadModel from '../interfaces/readModels/VersionReadModel.js';

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

export default AppBFF;