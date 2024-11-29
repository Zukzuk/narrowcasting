import aggregateFactory from '../domain/AggregateFactory.js';
import { TCommand } from '../domain/Command.js';
import CrawlCommand, { CRAWL_COMMAND } from '../domain/comics/commands/CrawlCommand.js';
import RandomImageCommand, { RANDOM_IMAGE_COMMAND } from '../domain/shared/commands/RandomImageCommand.js';

import broker from '../infrastructure/broker/Broker.js'; // Singleton instance

class CommandHandler {
    eventHandlers: any;

    constructor() {
        this.eventHandlers = {
            [CRAWL_COMMAND]: async (command: CrawlCommand) => {
                const aggregateRoot = aggregateFactory.createCrawlComics();
                return await aggregateRoot.consume(command);
            },
            [RANDOM_IMAGE_COMMAND]: async (command: RandomImageCommand) => {
                let aggregateRoot;
                if (Math.random() > .5) aggregateRoot = aggregateFactory.createRandomComicImage();
                else aggregateRoot = aggregateFactory.createRandomMediaCover();
                return await aggregateRoot.consume(command);
            }
        };
    }

    bootstrap() {
        broker.sub(CrawlCommand.type, command => this.#handle(command));
        broker.sub(RandomImageCommand.type, command => this.#handle(command));
    }

    async #handle(command: TCommand) {
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

export default new CommandHandler(); // Singleton instance through ES6 module caching