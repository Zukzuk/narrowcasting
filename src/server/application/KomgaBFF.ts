import CommandHandler from './CommandHandler.js';
import { CrawlCommand } from '../domain/komga/commands/CrawlCommand.js';
import { CrawlCompletedEventType } from '../domain/komga/events/CrawlCompletedEvent.js';
import { CrawlFailedEventType } from '../domain/komga/events/CrawlFailedEvent.js';
import AggregateFactory from '../domain/komga/AggregateFactory.js';
import CacheRepository from '../infrastructure/repositories/CacheRepository.js';
import KomgaCrawlReadModel from '../interfaces/readModels/KomgaCrawlReadModel.js';
import ErrorReadModel from '../interfaces/readModels/ErrorReadModel.js';
import VersionReadModel from '../interfaces/readModels/VersionReadModel.js';
import KomgaNarrowcastingApi from '../interfaces/api/KomgaNarrowcastingApi.js';

class KomgaBFF {
    private commandHandler: CommandHandler;
    private komgaCrawlReadModel: KomgaCrawlReadModel;
    private errorReadModel: ErrorReadModel;
    private versionReadModel: VersionReadModel;

    constructor() {
        // This wiring should be done in the handler
        // aggregates and command handler
        const crawlRepository = new CacheRepository();
        const aggregateFactory = new AggregateFactory(crawlRepository);
        this.commandHandler = new CommandHandler(aggregateFactory);

        // read models
        this.komgaCrawlReadModel = new KomgaCrawlReadModel();
        this.errorReadModel = new ErrorReadModel();
        this.versionReadModel = new VersionReadModel();
    }

    bootstrap(server: any, path: string) {
        // bootstrap
        this.#useApi(server, path);
        this.#setupListeners();
        this.#initialCommands();
    }

    #useApi(server: any, path: string) {
        // read model and router orchestration
        server.use(path, KomgaNarrowcastingApi({ 
            commandHandler: this.commandHandler,
            komgaCrawlReadModel: this.komgaCrawlReadModel, 
            errorReadModel: this.errorReadModel, 
        }));
    }

    #setupListeners() {
        // This should listen to the queryDB, with a socket connection, or a listener when internal
        // business event and query orchestration
        this.commandHandler.on(CrawlCompletedEventType, event => this.komgaCrawlReadModel.onCrawlCompleted(event));
        this.commandHandler.on(CrawlFailedEventType, event => this.errorReadModel.onApiCallFailed(event));
    }

    #initialCommands() {
        // This should be a command that is sent to the CommandBus, but we don't have that yet
        // fire bootstrap commands
        this.commandHandler.handle(new CrawlCommand({ payload: { endpoint: 'series' }, timestamp: new Date().toISOString() }));
        this.commandHandler.handle(new CrawlCommand({ payload: { endpoint: 'collections' }, timestamp: new Date().toISOString() }));
    }

}

export default KomgaBFF;