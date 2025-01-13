import { TEvent } from '../../domain/core/types/index.js';
import RetrieveImageCommand from '../../domain/core/commands/RetrieveImageCommand.js';
import SelectRandomImageCommand from '../../domain/core/commands/SelectRandomImageCommand.js';
import RetryImageRetrievalEvent, { RETRY_IMAGE_RETRIEVAL_EVENT } from '../../domain/core/events/RetryImageRetrievalEvent.js';
import RandomImageSelectedEvent, { RANDOM_IMAGE_SELECTED_EVENT } from '../../domain/core/events/RandomImageSelectedEvent.js';
import { log } from '../../utils.js';

import broker from '../../infrastructure/broker/Broker.js'; // Singleton instance

/**
 * Singleton class that orchestrates the application backend event to command handler.
 */
class EventToCommandHandlerSingleton {

    eventToCommandHandler: any;

    constructor() {
        this.eventToCommandHandler = {
            [RANDOM_IMAGE_SELECTED_EVENT]: (event: RandomImageSelectedEvent) => new RetrieveImageCommand(event.payload),
            [RETRY_IMAGE_RETRIEVAL_EVENT]: (event: RetryImageRetrievalEvent) => new SelectRandomImageCommand(event.payload),
        };
    }

    bootstrap() {
        log('EventToCommandHandlerSingleton.bootstrap', 'subscribe', `
            \t${RANDOM_IMAGE_SELECTED_EVENT}
            \t${RETRY_IMAGE_RETRIEVAL_EVENT}
        `);
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
                log('EventToCommandHandlerSingleton.#handle', 'publish', command.type);
                broker.pub(command);
            }
        } catch (error: any) {
            log('EventToCommandHandlerSingleton.#handle', 'publish', error.event.type);
            broker.pub(error.event);
            delete error.event;
            // Optionally rethrow or handle the error
        }
    }
}

export default new EventToCommandHandlerSingleton(); // Singleton instance through ES6 module caching