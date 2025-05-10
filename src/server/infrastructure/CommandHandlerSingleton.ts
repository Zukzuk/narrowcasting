import aggregateFactory from './AggregateFactorySingleton.js';
import { mediaTypesPlaynite, mediaTypesPlex } from '../domain/types/index.js';
import { TCommand } from '../domain/commands/Commands.js';
import { SELECT_RANDOM_IMAGE_COMMAND } from '../domain/commands/SelectRandomImageCommand.js';
import { CREATE_RANDOMIZED_LIST_COMMAND } from '../domain/commands/CreateRandomizedListCommand.js';
import { TRAVERSE_LIBRARY_COMMAND } from '../domain/commands/TraverseLibraryCommand.js';
import RetrieveImageCommand, { RETRIEVE_IMAGE_COMMAND } from '../domain/commands/RetrieveImageCommand.js';
import { log } from '../utils.js';

import broker from './BrokerSingleton.js'; // Singleton instance

/**
 * Singleton class that orchestrates the application backend command handler.
 * 
 * @class CommandHandlerSingleton
 */
class CommandHandlerSingleton {

    eventHandlers: any;

    constructor() {
        this.eventHandlers = {
            [CREATE_RANDOMIZED_LIST_COMMAND]: () => aggregateFactory.createCreateRandomizedList(),
            [SELECT_RANDOM_IMAGE_COMMAND]: () => aggregateFactory.createSelectFromRandomizedList(),
            [RETRIEVE_IMAGE_COMMAND]: (command: RetrieveImageCommand) => {
                const { mediaType } = command.payload;
                if (mediaTypesPlaynite.some(type => type === mediaType)) return aggregateFactory.createRetrieveGamesCover();
                else if (mediaTypesPlex.some(type => type === mediaType)) return aggregateFactory.createRetrieveMediaCover();
            },
            [TRAVERSE_LIBRARY_COMMAND]: () => aggregateFactory.createTraverseLibrary(),
        };
    }

    /**
     * Bootstraps the application backend command handler.
     */
    bootstrap() {
        log('CommandHandler.bootstrap', 'subscribe', `
            \t${CREATE_RANDOMIZED_LIST_COMMAND}
            \t${SELECT_RANDOM_IMAGE_COMMAND}
            \t${RETRIEVE_IMAGE_COMMAND}
            \t${TRAVERSE_LIBRARY_COMMAND}
        `);
        broker.sub(CREATE_RANDOMIZED_LIST_COMMAND, command => this.#handle(command));
        broker.sub(SELECT_RANDOM_IMAGE_COMMAND, command => this.#handle(command));
        broker.sub(RETRIEVE_IMAGE_COMMAND, command => this.#handle(command));
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
            if (handler) {
                let events = await handler.consume(command);
                if (!Array.isArray(events)) events = [events];
                for (const event of events) {
                    log('CommandHandler.#handle', 'publish', event.type);
                    broker.pub(event);
                }
            }
        } catch (error: any) {
            log('CommandHandler.#handle', 'publish', error);
            broker.pub(error.event);
            delete error.event;
            // Optionally rethrow or handle the error
        }
    }
}

export default new CommandHandlerSingleton(); // Singleton instance through ES6 module caching