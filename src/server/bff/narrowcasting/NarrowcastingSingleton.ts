import { log } from '../../utils.js';
import AppApi from '../apis/AppApi.js';
import ComicsApi from '../apis/ComicsApi.js';
import MediaApi from '../apis/MediaApi.js';
import GamesApi from '../apis/GamesApi.js';
import VersionReadModel from '../readmodels/VersionReadModel.js';
import ErrorReadModel from '../readmodels/ErrorReadModel.js';
import ComicsCrawlReadModel from '../readmodels/ComicsCrawlReadModel.js';
import LibraryDirectoryTreeReadModel from '../readmodels/LibraryDirectoryTreeReadModel.js';
import ImageReadModel from '../readmodels/ImageReadModel.js';
import TraverseLibraryCommand from '../../domain/commands/TraverseLibraryCommand.js';
import CreateRandomizedListCommand from '../../domain/commands/CreateRandomizedListCommand.js';
import CrawlEndpointCommand from '../../domain/commands/CrawlComicsCommand.js';
import { KOMGA_TAVERSAL_ORIGIN } from '../../config.js';

import broker from '../../infrastructure/BrokerSingleton.js'; // Singleton instance

/**
 * Singleton class that orchestrates the BFF narrowcasting.
 */
class NarrowcastingSingleton {

    constructor(
        private versionReadModel: VersionReadModel,
        private errorReadModel: ErrorReadModel,
        private comicsCrawlReadModel: ComicsCrawlReadModel,
        private libraryDirectoryTreeReadModel: LibraryDirectoryTreeReadModel,
        private imageReadModel: ImageReadModel,
    ) { }

    /**
     * Bootstraps the BFF narrowcasting.
     * 
     * @param server The server to bootstrap the BFF narrowcasting on.
     * @param APP_API_PATH The API path.
     * @param APP_SESSION_SECRET The application session secret.
     * @param USER_SESSION_SECRET The user session secret.
     */
    bootstrap(
        server: any,
        {
            APP_API_PATH,
            APP_SESSION_SECRET,
            USER_SESSION_SECRET,
        }: {
            APP_API_PATH: string,
            APP_SESSION_SECRET: string,
            USER_SESSION_SECRET: string,
        },
    ) {
        // implement apis
        server.use(APP_API_PATH, AppApi(
            USER_SESSION_SECRET,
            APP_SESSION_SECRET,
            {
                versionReadModel: this.versionReadModel,
                errorReadModel: this.errorReadModel,
                imageReadModel: this.imageReadModel,
            }
        ));
        server.use(APP_API_PATH, ComicsApi(
            APP_SESSION_SECRET,
            {
                comicsCrawlReadModel: this.comicsCrawlReadModel,
                libraryDirectoryTreeReadModel: this.libraryDirectoryTreeReadModel,
            }
        ));
        server.use(APP_API_PATH, MediaApi({
        }));
        server.use(APP_API_PATH, GamesApi({
        }));
    }

    /**
     * Publishes the eager commands to the broker.
     * 
     * @param APP_SESSION_SECRET The application session secret.
     */
    prewarm({
        APP_SESSION_SECRET,
    }: {
        APP_SESSION_SECRET: string,
    },) {
        log('Narrowcasting.prewarm', 'publish', `
            \t${CreateRandomizedListCommand.type}
            \t${TraverseLibraryCommand.type} of library: ${KOMGA_TAVERSAL_ORIGIN}
            \t${CrawlEndpointCommand.type} of endpoint: 'series'
            \t${CrawlEndpointCommand.type} of endpoint: 'collections'
        `);
        broker.pub(new CreateRandomizedListCommand({ userId: APP_SESSION_SECRET, page: 0, interval: 0, startTime: 0 }));
        broker.pub(new TraverseLibraryCommand({ userId: APP_SESSION_SECRET, library: KOMGA_TAVERSAL_ORIGIN }));
        broker.pub(new CrawlEndpointCommand({ userId: APP_SESSION_SECRET, endpoint: 'series' }));
        broker.pub(new CrawlEndpointCommand({ userId: APP_SESSION_SECRET, endpoint: 'collections' }));
    }
}

export default new NarrowcastingSingleton(
    new VersionReadModel(),
    new ErrorReadModel(),
    new ComicsCrawlReadModel(),
    new LibraryDirectoryTreeReadModel(),
    new ImageReadModel(),
); // Singleton instance through ES6 module caching