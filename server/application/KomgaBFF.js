const CommandHandler = require('./CommandHandler');
const { CrawlCommand } = require('../domain/komga/commands/CrawlCommand');
const { CrawlCompletedEventType } = require('../domain/komga/events/CrawlCompletedEvent');
const { CrawlFailedEventType } = require('../domain/komga/events/CrawlFailedEvent');
const AggregateFactory = require('../domain/komga/AggregateFactory');
const CacheRepository = require('../infrastructure/repositories/CacheRepository');
const KomgaCrawlReadModel = require('../interfaces/readModels/KomgaCrawlReadModel');
const ErrorReadModel = require('../interfaces/readModels/ErrorReadModel');
const VersionReadModel = require('../interfaces/readModels/VersionReadModel');
const KomgaNarrowcastingApi = require('../interfaces/api/KomgaNarrowcastingApi');

class KomgaBFF {
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

    bootstrap(server, path) {
        // bootstrap
        this.#useApi(server, path);
        this.#setupListeners();
        this.#initialCommands();
    }

    #useApi(server, path) {
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
        this.commandHandler.on(CrawlCompletedEventType, event => this.crawlReadModel.onCrawlCompleted(event));
        this.commandHandler.on(CrawlFailedEventType, event => this.errorReadModel.onApiCallFailed(event));
    }

    #initialCommands() {
        // This should be a command that is sent to the CommandBus, but we don't have that yet
        // fire bootstrap commands
        this.commandHandler.handle(new CrawlCommand({ payload: { endpoint: 'series' }, timestamp: new Date().toISOString() }));
        this.commandHandler.handle(new CrawlCommand({ payload: { endpoint: 'collections' }, timestamp: new Date().toISOString() }));
    }

}

module.exports = KomgaBFF;