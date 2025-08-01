import { APP_API_PATH, APP_SESSION_SECRET, USER_SESSION_SECRET } from '../config.js';

import commandHandler from './CommandHandlerSingleton.js'; // Singleton instance
import crawlKomgaCommandHandler from '../domain/applications/komga/crawl/commandhandler.singleton.js'; // Singleton instance
import retrieveImageKomgaCommandHandler from '../domain/applications/komga/retrieve-image/commandhandler.singleton.js'; // Singleton instance
import retrieveImagePlexCommandHandler from '../domain/applications/plex/retrieve-image/commandhandler.singleton.js'; // Singleton instance
import retrieveImagePlayniteCommandHandler from '../domain/applications/playnite/retrieve-image/commandhandler.singleton.js'; // Singleton instance
import eventToCommandHandler from './EventToCommandHandlerSingleton.js'; // Singleton instance
import bffNarrowcasting from '../bff/narrowcasting/NarrowcastingSingleton.js'; // Singleton instance

/**
 * Singleton class that orchestrates the application.
 */
class OrchestratorSingleton {
    
    constructor() { }

    /**
     * Bootstraps all infrastructure.
     * 
     * @param {any} server The server to bootstrap the infrastructure on.
     */
    init = (server: any) => {
        commandHandler.bootstrap();
        crawlKomgaCommandHandler.bootstrap();
        retrieveImageKomgaCommandHandler.bootstrap();
        retrieveImagePlexCommandHandler.bootstrap();
        retrieveImagePlayniteCommandHandler.bootstrap();
        eventToCommandHandler.bootstrap();
        bffNarrowcasting.bootstrap(server, { APP_API_PATH, APP_SESSION_SECRET, USER_SESSION_SECRET });
        bffNarrowcasting.prewarm({ APP_SESSION_SECRET });
    }
}

export default new OrchestratorSingleton(); // Singleton instance through ES6 module caching