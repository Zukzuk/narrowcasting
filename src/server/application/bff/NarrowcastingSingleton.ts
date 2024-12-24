import AppApi from '../../interfaces/apis/AppApi.js';
import ComicsApi from '../../interfaces/apis/ComicsApi.js';
import MediaApi from '../../interfaces/apis/MediaApi.js';
import VersionReadModel from '../../interfaces/readmodels/VersionReadModel.js';
import ErrorReadModel from '../../interfaces/readmodels/ErrorReadModel.js';
import ComicsCrawlReadModel from '../../interfaces/readmodels/ComicsCrawlReadModel.js';
import ImageReadModel from '../../interfaces/readmodels/ImageReadModel.js';
import CrawlCommand from '../../domain/shared/commands/CrawlCommand.js';

import broker from '../../infrastructure/broker/Broker.js'; // Singleton instance

class NarrowcastingSingleton {
    
    constructor(
        private versionReadModel: VersionReadModel,
        private errorReadModel: ErrorReadModel,
        private comicsCrawlReadModel: ComicsCrawlReadModel,
        private imageReadModel: ImageReadModel,
    ) { }
    
    bootstrap(
        app: any,
        { APP_API_PATH }: { APP_API_PATH: string },
    ) {
        // implement apis
        app.use(APP_API_PATH, AppApi({
            versionReadModel: this.versionReadModel,
            imageReadModel: this.imageReadModel,
        }));
        app.use(APP_API_PATH, ComicsApi({
            comicsCrawlReadModel: this.comicsCrawlReadModel,
        }));
        app.use(APP_API_PATH, MediaApi({
        }));

        // eager commands
        broker.pub(new CrawlCommand({ endpoint: 'series' }));
        broker.pub(new CrawlCommand({ endpoint: 'collections' }));
    }
}

export default new NarrowcastingSingleton(
    new VersionReadModel(),
    new ErrorReadModel(),
    new ComicsCrawlReadModel(),
    new ImageReadModel(),
); // Singleton instance through ES6 module caching