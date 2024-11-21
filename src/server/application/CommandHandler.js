import { EventEmitter } from 'events';

class CommandHandler extends EventEmitter {
    constructor(aggregateFactory) {
        super();
        this.aggregateFactory = aggregateFactory;
    }

    async handle(command) {
        switch (command.type) {
            case 'CrawlCommand':
                try {
                    const crawlAggregateRoot = this.aggregateFactory.createCrawlAggregate();
                    const event = await crawlAggregateRoot.crawl(command.payload);
                    this.emit(event.type, event);
                } catch (error) {
                    this.emit(error.event?.type, error.event);
                    delete error.event;
                    // throw error;
                }
                break;
            default:
                throw new Error(`Unsupported command type: ${command.type}`);
        }
    }
}

export default CommandHandler;
