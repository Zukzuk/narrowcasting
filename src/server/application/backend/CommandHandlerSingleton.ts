import aggregateFactory from './AggregateFactorySingleton.js';
import { mediaTypesKomga, mediaTypesPlaynite, mediaTypesPlex, TCommand } from '../../domain/core/types/index.js';
import { CRAWL_ENDPOINT_COMMAND } from '../../domain/core/commands/CrawlEndpointCommand.js';
import { SELECT_RANDOM_IMAGE_COMMAND } from '../../domain/core/commands/SelectRandomImageCommand.js';
import { CREATE_RANDOMIZED_LIST_COMMAND } from '../../domain/core/commands/CreateRandomizedListCommand.js';
import { TRAVERSE_LIBRARY_COMMAND } from '../../domain/core/commands/TraverseLibraryCommand.js';
import RetrieveImageCommand, { RETRIEVE_IMAGE_COMMAND } from '../../domain/core/commands/RetrieveImageCommand.js';
import { log } from '../../utils.js';

import broker from '../../infrastructure/broker/Broker.js'; // Singleton instance

/**
 * Singleton class that orchestrates the application backend command handler.
 * 
 * @class CommandHandlerSingleton
 */
class CommandHandlerSingleton {

    eventHandlers: any;

    constructor() {
        console.log('CommandHandlerSingleton.constructor')
        this.eventHandlers = {
            [CREATE_RANDOMIZED_LIST_COMMAND]: () => aggregateFactory.createSelectFromRandomizedList(),
            [SELECT_RANDOM_IMAGE_COMMAND]: () => aggregateFactory.createSelectFromRandomizedList(),
            [RETRIEVE_IMAGE_COMMAND]: (command: RetrieveImageCommand) => {
                const { mediaType } = command.payload;
                if (mediaTypesKomga.some(type => type === mediaType)) return aggregateFactory.createRetrieveComicsImage();
                else if (mediaTypesPlaynite.some(type => type === mediaType)) return aggregateFactory.createRetrieveGamesCover();
                else if (mediaTypesPlex.some(type => type === mediaType)) return aggregateFactory.createRetrieveMediaCover();
                else throw new Error(`Unsupported media type: ${mediaType}`);
            },
            [CRAWL_ENDPOINT_COMMAND]: () => aggregateFactory.createCrawlComics(),
            [TRAVERSE_LIBRARY_COMMAND]: () => aggregateFactory.createTraverseLibrary(),
        };
    }

    /**
     * Bootstraps the application backend command handler.
     */
    bootstrap() {
        log('CommandHandlerSingleton.bootstrap', 'subscribe', `
            \t${CREATE_RANDOMIZED_LIST_COMMAND}
            \t${SELECT_RANDOM_IMAGE_COMMAND}
            \t${RETRIEVE_IMAGE_COMMAND}
            \t${CRAWL_ENDPOINT_COMMAND}
            \t${TRAVERSE_LIBRARY_COMMAND}
        `);
        broker.sub(CREATE_RANDOMIZED_LIST_COMMAND, command => this.#handle(command));
        broker.sub(SELECT_RANDOM_IMAGE_COMMAND, command => this.#handle(command));
        broker.sub(RETRIEVE_IMAGE_COMMAND, command => this.#handle(command));
        broker.sub(CRAWL_ENDPOINT_COMMAND, command => this.#handle(command));
        broker.sub(TRAVERSE_LIBRARY_COMMAND, command => this.#handle(command));
    }

    /**
     * Handles the command by delegating it to the appropriate event handler.
     * 
     * @param {TCommand} command The command to handle.
     */
    async #handle(command: TCommand) {
        if (!this.eventHandlers[command.type]) {
            throw new Error(`Unsupported command type: ${command.type}`);
        }

        try {
            const handler = this.eventHandlers[command.type](command);
            let events = await handler.consume(command);
            if (!Array.isArray(events)) events = [events];
            for (const event of events) {
                log('CommandHandlerSingleton.#handle', 'publish', event.type);
                broker.pub(event);
            }
        } catch (error: any) {
            log('CommandHandlerSingleton.#handle', 'publish', error.event.type);
            broker.pub(error.event);
            delete error.event;
            // Optionally rethrow or handle the error
        }
    }
}

export default new CommandHandlerSingleton(); // Singleton instance through ES6 module caching