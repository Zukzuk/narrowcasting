import AppApi from '../interfaces/apis/AppApi.js';
import VersionReadModel from '../interfaces/readmodels/VersionReadModel.js';
import ComicsCrawlReadModel from '../interfaces/readmodels/ComicsCrawlReadModel.js';
import ComicsNarrowcastingApi from '../interfaces/apis/ComicsNarrowcastingApi.js';
import ImageReadModel from '../interfaces/readmodels/ImageReadModel.js';
import CrawlCommand from '../domain/comics/commands/CrawlCommand.js';

import broker from '../infrastructure/broker/Broker.js'; // Singleton instance

export default class NarrowcastingBFF {
    bootstrap(
        app: any,
        {
            APP_API_PATH,
            COMICS_NARROWCASTING_API_PATH,
        }: {
            APP_API_PATH: string,
            COMICS_NARROWCASTING_API_PATH: string,
        }
    ) {
        // implement apis
        app.use(APP_API_PATH, AppApi({
            versionReadModel: new VersionReadModel(),
        }));
        app.use(COMICS_NARROWCASTING_API_PATH, ComicsNarrowcastingApi({
            comicsCrawlReadModel: new ComicsCrawlReadModel(),
            imageReadModel: new ImageReadModel(),
        }));

        // eager commands
        broker.pub(new CrawlCommand(
            {
                payload: { endpoint: 'series' },
                timestamp: new Date().toISOString(),
            }
        ));
        broker.pub(new CrawlCommand(
            { 
                payload: { endpoint: 'collections' }, 
                timestamp: new Date().toISOString(),
            }
        ));
    }
}