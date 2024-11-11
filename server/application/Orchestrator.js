const CommandHandler = require('./CommandHandler');
const createRouter = require('../interfaces/api/router');
const AggregateFactory = require('../domain/komga/AggregateFactory');
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

        // bootstrap
        this.#setupListeners();
        this.#initialCommands();
    }

    useApi(server, path) {
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
        this.commandHandler.on('CrawlCompletedEvent', event => this.crawlReadModel.onCrawlCompleted(event));
        this.commandHandler.on('CrawlFailedEvent', event => this.errorReadModel.onApiCallFailed(event));
    }

    #initialCommands() {
        // fire bootstrap commands
        this.commandHandler.handle({ type: 'CrawlCommand', payload: { endpoint: 'series' } });
        this.commandHandler.handle({ type: 'CrawlCommand', payload: { endpoint: 'collections' } });
    }

}

module.exports = Orchestrator;