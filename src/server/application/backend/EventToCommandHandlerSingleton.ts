import { TEvent } from '../../domain/shared/types/index.js';
import RetrieveImageCommand from '../../domain/shared/commands/RetrieveImageCommand.js';
import SelectRandomImageCommand from '../../domain/shared/commands/SelectRandomImageCommand.js';
import RetryImageRetrievalEvent, { RETRY_IMAGE_RETRIEVAL_EVENT } from '../../domain/shared/events/RetryImageRetrievalEvent.js';
import RandomImageSelectedEvent, { RANDOM_IMAGE_SELECTED_EVENT } from '../../domain/shared/events/RandomImageSelectedEvent.js';

import broker from '../../infrastructure/broker/Broker.js'; // Singleton instance

class EventToCommandHandlerSingleton {

    eventToCommandHandler: any;

    constructor() {
        this.eventToCommandHandler = {
            [RANDOM_IMAGE_SELECTED_EVENT]: async (event: RandomImageSelectedEvent) => {
                return new RetrieveImageCommand(event.payload);
            },
            [RETRY_IMAGE_RETRIEVAL_EVENT]: async (event: RetryImageRetrievalEvent) => {
                return new SelectRandomImageCommand(event.payload);
            },
        };
    }

    bootstrap() {
        broker.sub(RANDOM_IMAGE_SELECTED_EVENT, event => this.#handle(event));
        broker.sub(RETRY_IMAGE_RETRIEVAL_EVENT, event => this.#handle(event));
    }

    async #handle(event: TEvent) {
        if (!this.eventToCommandHandler[event.type]) {
            throw new Error(`Unsupported event type: ${event.type}`);
        }
    
        try {
            let commands = await this.eventToCommandHandler[event.type](event);
            if (!Array.isArray(commands)) commands = [commands];
            for (const command of commands) broker.pub(command);
        } catch (error: any) {
            broker.pub(error.event);
            delete error.event;
            // Optionally rethrow or handle the error
        }
    }    
}

export default new EventToCommandHandlerSingleton(); // Singleton instance through ES6 module caching