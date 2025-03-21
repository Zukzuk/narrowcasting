import { APP_API_PATH, APP_SESSION_SECRET, USER_SESSION_SECRET } from '../config.js';

import bffNarrowcasting from './bff/NarrowcastingSingleton.js'; // Singleton instance
import commandHandler from './backend/CommandHandlerSingleton.js'; // Singleton instance
import eventToCommandHandler from './backend/EventToCommandHandlerSingleton.js'; // Singleton instance

/**
 * Singleton class that orchestrates the application.
 */
class OrchestratorSingleton {
    
    constructor() { }

    /**
     * Bootstraps the application.
     * 
     * @param {any} server The server to bootstrap the application on.
     */
    init = (server: any) => {
        commandHandler.bootstrap();
        eventToCommandHandler.bootstrap();
        bffNarrowcasting.bootstrap(server, { APP_API_PATH, APP_SESSION_SECRET, USER_SESSION_SECRET });
    }
}

export default new OrchestratorSingleton(); // Singleton instance through ES6 module caching