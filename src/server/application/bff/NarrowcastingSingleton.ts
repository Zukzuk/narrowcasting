import AppApi from '../../interfaces/apis/AppApi.js';
import ComicsApi from '../../interfaces/apis/ComicsApi.js';
import MediaApi from '../../interfaces/apis/MediaApi.js';
import GamesApi from '../../interfaces/apis/GamesApi.js';
import VersionReadModel from '../../interfaces/readmodels/VersionReadModel.js';
import ErrorReadModel from '../../interfaces/readmodels/ErrorReadModel.js';
import ComicsCrawlReadModel from '../../interfaces/readmodels/ComicsCrawlReadModel.js';
import ImageReadModel from '../../interfaces/readmodels/ImageReadModel.js';
import TraverseLibraryCommand from '../../domain/shared/commands/TraverseLibraryCommand.js';
import CrawlCommand from '../../domain/shared/commands/CrawlCommand.js';

import broker from '../../infrastructure/broker/Broker.js'; // Singleton instance

/**
 * Singleton class that orchestrates the BFF narrowcasting.
 * 
 * It initializes the BFF narrowcasting by bootstrapping the BFF APIs.
 */
class NarrowcastingSingleton {
    
    constructor(
        private versionReadModel: VersionReadModel,
        private errorReadModel: ErrorReadModel,
        private comicsCrawlReadModel: ComicsCrawlReadModel,
        private imageReadModel: ImageReadModel,
    ) { }
    
    /**
     * Bootstraps the BFF narrowcasting.
     * 
     * It initializes the BFF APIs.
     * 
     * @param server The server to bootstrap the BFF narrowcasting on.
     * @param APP_API_PATH The API path.
     * @param APP_SESSION_SECRET The application session secret.
     * @param USER_SESSION_SECRET The user session secret.
     */
    bootstrap(
        server: any,
        { APP_API_PATH, APP_SESSION_SECRET, USER_SESSION_SECRET }: { APP_API_PATH: string, APP_SESSION_SECRET: string, USER_SESSION_SECRET: string },
    ) {
        // implement apis
        server.use(APP_API_PATH, AppApi(USER_SESSION_SECRET, {
            versionReadModel: this.versionReadModel,
            errorReadModel: this.errorReadModel,
            imageReadModel: this.imageReadModel,
        }));
        server.use(APP_API_PATH, ComicsApi({
            comicsCrawlReadModel: this.comicsCrawlReadModel,
        }));
        server.use(APP_API_PATH, MediaApi({
        }));
        server.use(APP_API_PATH, GamesApi({
        }));

        // eager commands
        broker.pub(new TraverseLibraryCommand({ userId: APP_SESSION_SECRET, library: 'comics' }));
        // broker.pub(new CrawlCommand({ userId: APP_SESSION_SECRET, endpoint: 'series' }));
        // broker.pub(new CrawlCommand({ userId: APP_SESSION_SECRET, endpoint: 'collections' }));
    }
}

export default new NarrowcastingSingleton(
    new VersionReadModel(),
    new ErrorReadModel(),
    new ComicsCrawlReadModel(),
    new ImageReadModel(),
); // Singleton instance through ES6 module caching