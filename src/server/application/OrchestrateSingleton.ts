import { APP_API_PATH } from '../config.js';

import bffNarrowcasting from './bff/NarrowcastingSingleton.js'; // Singleton instance
import commandHandler from './backend/CommandHandlerSingleton.js'; // Singleton instance
import eventToCommandHandler from './backend/EventToCommandHandlerSingleton.js'; // Singleton instance

class OrchestratorSingleton {
    
    constructor() { }

    init = (server: any) => {
        commandHandler.bootstrap();
        eventToCommandHandler.bootstrap();
        bffNarrowcasting.bootstrap(server, { APP_API_PATH });
    }
}

export default new OrchestratorSingleton(); // Singleton instance through ES6 module caching