const CommandHandler = require('./CommandHandler');
const { CrawlCommand } = require('../domain/komga/commands/CrawlCommand');
const { CrawlCompletedEventType } = require('../domain/komga/events/CrawlCompletedEvent');
const { CrawlFailedEventType } = require('../domain/komga/events/CrawlFailedEvent');
const AggregateFactory = require('../domain/komga/AggregateFactory');
const createRouter = require('../interfaces/api/router');
const CacheRepository = require('../infrastructure/repositories/CacheRepository');
const CrawlReadModel = require('../interfaces/readModels/CrawlReadModel');
const ErrorReadModel = require('../interfaces/readModels/ErrorReadModel');
const VersionReadModel = require('../interfaces/readModels/VersionReadModel');

class Orchestrator {
    constructor() {
        // aggregates and command handler
        const crawlRepository = new CacheRepository();
        const aggregateFactory = new AggregateFactory(crawlRepository);
        this.commandHandler = new CommandHandler(aggregateFactory);

        // read models
        this.crawlReadModel = new CrawlReadModel();
        this.errorReadModel = new ErrorReadModel();
        this.versionReadModel = new VersionReadModel();
    }

    bootstrap(server, NARROWCASTING_API_PATH) {
        // bootstrap
        this.#useApi(server, NARROWCASTING_API_PATH);
        this.#setupListeners();
        this.#initialCommands();
    }

    #useApi(server, path) {
        // read model and router orchestration
        server.use(path, createRouter({ 
            commandHandler: this.commandHandler,
            crawlReadModel: this.crawlReadModel, 
            errorReadModel: this.errorReadModel, 
            versionReadModel: this.versionReadModel,
        }));
    }

    #setupListeners() {
        // business event and query orchestration
        this.commandHandler.on(CrawlCompletedEventType, event => this.crawlReadModel.onCrawlCompleted(event));
        this.commandHandler.on(CrawlFailedEventType, event => this.errorReadModel.onApiCallFailed(event));
    }

    #initialCommands() {
        // fire bootstrap commands
        this.commandHandler.handle(new CrawlCommand({ payload: { endpoint: 'series' }, timestamp: new Date().toISOString() }));
        this.commandHandler.handle(new CrawlCommand({ payload: { endpoint: 'collections' }, timestamp: new Date().toISOString() }));
    }

}

module.exports = Orchestrator;