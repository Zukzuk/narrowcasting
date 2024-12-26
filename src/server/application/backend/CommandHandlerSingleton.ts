import aggregateFactory from './AggregateFactorySingleton.js';
import { TCommand } from '../../domain/shared/types/index.js';
import CrawlCommand, { CRAWL_COMMAND } from '../../domain/shared/commands/CrawlCommand.js';
import SelectRandomImageCommand, { SELECT_RANDOM_IMAGE_COMMAND } from '../../domain/shared/commands/SelectRandomImageCommand.js';
import RetrieveImageCommand, { RETRIEVE_IMAGE_COMMAND } from '../../domain/shared/commands/RetrieveImageCommand.js';

import broker from '../../infrastructure/broker/Broker.js'; // Singleton instance

class CommandHandlerSingleton {

    eventHandlers: any;

    constructor() {
        this.eventHandlers = {
            [SELECT_RANDOM_IMAGE_COMMAND]: async (command: SelectRandomImageCommand) => {
                const aggregateRoot = aggregateFactory.createSelectRandomImage();
                return await aggregateRoot.consume(command);
            },
            [RETRIEVE_IMAGE_COMMAND]: async (command: RetrieveImageCommand) => {
                let aggregateRoot;
                if (command.payload.mediaType === "comics") aggregateRoot = aggregateFactory.createRetrieveComicImage();
                else if (command.payload.mediaType === "games") aggregateRoot = aggregateFactory.createRetrieveGamesImage();
                else aggregateRoot = aggregateFactory.createRetrieveMediaCover();
                return await aggregateRoot.consume(command);
            },
            [CRAWL_COMMAND]: async (command: CrawlCommand) => {
                const aggregateRoot = aggregateFactory.createCrawlComics();
                return await aggregateRoot.consume(command);
            },
        };
    }

    bootstrap() {
        broker.sub(SELECT_RANDOM_IMAGE_COMMAND, command => this.#handle(command));
        broker.sub(RETRIEVE_IMAGE_COMMAND, command => this.#handle(command));
        broker.sub(CRAWL_COMMAND, command => this.#handle(command));
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

export default new CommandHandlerSingleton(); // Singleton instance through ES6 module caching