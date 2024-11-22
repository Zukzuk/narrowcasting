import { EventEmitter } from 'events';
import AggregateFactory from '../domain/komga/AggregateFactory.js';
import { CRAWL_COMMAND, ICommand } from '../domain/komga/commands/Command.js';
import { CrawlCommand } from '../domain/komga/commands/CrawlCommand.js';

class CommandHandler extends EventEmitter {
    constructor(private aggregateFactory: AggregateFactory) {
        super();
    }

    async handle(command: ICommand) {
        switch (command.type) {
            case CRAWL_COMMAND:
                try {
                    const crawlAggregateRoot = this.aggregateFactory.createCrawlAggregate();
                    const event = await crawlAggregateRoot.aggregate(command as CrawlCommand);
                    this.emit(event.type, event);
                } catch (error: any) {
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
