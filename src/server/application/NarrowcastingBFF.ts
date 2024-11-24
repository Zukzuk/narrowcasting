import AppApi from '../interfaces/apis/AppApi.js';
import VersionReadModel from '../interfaces/readmodels/VersionReadModel.js';
import ComicsCrawlReadModel from '../interfaces/readmodels/ComicsCrawlReadModel.js';
import ComicsNarrowcastingApi from '../interfaces/apis/ComicsNarrowcastingApi.js';
import CrawlCommand from '../domain/comics/commands/CrawlCommand.js';

import broker from '../infrastructure/broker/Broker.js'; // Singleton instance

export default class NarrowcastingBFF {
    private comicsCrawlReadModel: ComicsCrawlReadModel;
    private versionReadModel: VersionReadModel;

    constructor() {
        // read models
        this.versionReadModel = new VersionReadModel();
        this.comicsCrawlReadModel = new ComicsCrawlReadModel();
    }

    bootstrap(server: any, APP_API_PATH: string, COMICS_NARROWCASTING_API_PATH: string) {
        // bootstrap the apis
        server.use(APP_API_PATH, AppApi({ 
            versionReadModel: this.versionReadModel,
        }));
        server.use(COMICS_NARROWCASTING_API_PATH, ComicsNarrowcastingApi({ 
            comicsCrawlReadModel: this.comicsCrawlReadModel,
        }));
        
        // eager publish bootstrap commands
        broker.pub(new CrawlCommand({ payload: { endpoint: 'series' }, timestamp: new Date().toISOString() }));
        broker.pub(new CrawlCommand({ payload: { endpoint: 'collections' }, timestamp: new Date().toISOString() }));
    }
}