import { TEvent } from '../domain/events/Events.js';
import RetrieveImageCommand from '../domain/commands/RetrieveImageCommand.js';
import SelectRandomImageCommand from '../domain/commands/SelectRandomImageCommand.js';
import CreateRandomizedListCommand from '../domain/commands/CreateRandomizedListCommand.js';
import InvalidRandomListEvent, { INVALID_RANDOMIZED_LIST_EVENT } from '../domain/events/InvalidRandomListEvent.js';
import RandomizedListCreatedEvent, { RANDOMIZED_LIST_CREATED_EVENT } from '../domain/events/RandomizedListCreatedEvent.js';
import RetryImageRetrievalEvent, { RETRY_IMAGE_RETRIEVAL_EVENT } from '../domain/events/RetryImageRetrievalEvent.js';
import RandomImageSelectedEvent, { RANDOM_IMAGE_SELECTED_EVENT } from '../domain/events/RandomImageSelectedEvent.js';
import { log } from '../utils.js';

import broker from './BrokerSingleton.js'; // Singleton instance

/**
 * Singleton class that orchestrates the application backend event to command handler.
 */
class EventToCommandHandlerSingleton {

    eventToCommandHandler: any;

    constructor() {
        this.eventToCommandHandler = {
            [INVALID_RANDOMIZED_LIST_EVENT]: (event: InvalidRandomListEvent) => new CreateRandomizedListCommand(event.payload),
            [RANDOMIZED_LIST_CREATED_EVENT]: (event: RandomizedListCreatedEvent) => new SelectRandomImageCommand(event.payload),
            [RANDOM_IMAGE_SELECTED_EVENT]: (event: RandomImageSelectedEvent) => new RetrieveImageCommand(event.payload, event.metaData),
            [RETRY_IMAGE_RETRIEVAL_EVENT]: (event: RetryImageRetrievalEvent) => new SelectRandomImageCommand(event.payload),
        };
    }

    bootstrap() {
        log('EventToCommandHandler.bootstrap()', 'subscribe', `
            \t${INVALID_RANDOMIZED_LIST_EVENT}
            \t${RANDOMIZED_LIST_CREATED_EVENT}
            \t${RANDOM_IMAGE_SELECTED_EVENT}
            \t${RETRY_IMAGE_RETRIEVAL_EVENT}
        `);
        broker.sub(INVALID_RANDOMIZED_LIST_EVENT, event => this.#handle(event));
        broker.sub(RANDOMIZED_LIST_CREATED_EVENT, event => this.#handle(event));
        broker.sub(RANDOM_IMAGE_SELECTED_EVENT, event => this.#handle(event));
        broker.sub(RETRY_IMAGE_RETRIEVAL_EVENT, event => this.#handle(event));
    }

    /**
     * Handles the event by delegating it to the appropriate command handler.
     * 
     * @param {TEvent} event The event to handle.
     */
    async #handle(event: TEvent) {
        if (!this.eventToCommandHandler[event.type]) {
            throw new Error(`Unsupported event type: ${event.type}`);
        }

        try {
            let commands = this.eventToCommandHandler[event.type](event);
            if (!Array.isArray(commands)) commands = [commands];
            for (const command of commands) {
                log('EventToCommandHandler.#handle()', 'publish', command.type);
                broker.pub(command);
            }
        } catch (error: any) {
            log('EventToCommandHandler.#handle()', 'publish', error.event.type);
            broker.pub(error.event);
            delete error.event;
            // Optionally rethrow or handle the error
        }
    }
}

export default new EventToCommandHandlerSingleton(); // Singleton instance through ES6 module caching