import AggregateFactory from '../domain/AggregateFactory.js';
import { ICommand, CRAWL_COMMAND, RANDOM_IMAGE_COMMAND } from '../domain/Command.js';
import CrawlCommand from '../domain/comics/commands/CrawlCommand.js';
import RandomImageCommand from '../domain/comics/commands/RandomImageCommand.js';

import broker from '../infrastructure/broker/Broker.js'; // Singleton instance

class CommandHandler {
    eventHandlers: any;

    constructor(private aggregateFactory: typeof AggregateFactory) {
        this.eventHandlers = {
            [CRAWL_COMMAND]: async (command: CrawlCommand) => {
                const aggregateRoot = this.aggregateFactory.createCrawlComics();
                return await aggregateRoot.consume(command);
            },
            [RANDOM_IMAGE_COMMAND]: async (command: RandomImageCommand) => {
                const aggregateRoot = this.aggregateFactory.createRandomComicImage();
                return await aggregateRoot.consume(command);
            }
        };
    }

    bootstrap() {
        broker.sub(CrawlCommand.type, command => this.#handle(command));
        broker.sub(RandomImageCommand.type, command => this.#handle(command));
    }

    async #handle(command: ICommand) {
        if (!this.eventHandlers[command.type]) {
            throw new Error(`Unsupported command type: ${command.type}`);
        }
    
        try {
            let events = await this.eventHandlers[command.type](command);
            if (!Array.isArray(events)) events = [events];
            for (const event of events) broker.pub(event);
        } catch (error: any) {
            broker.pub(error.event);
            delete error.event;
            // Optionally rethrow or handle the error
        }
    }    
}

import aggregateFactory from '../domain/AggregateFactory.js';
export default new CommandHandler(aggregateFactory);