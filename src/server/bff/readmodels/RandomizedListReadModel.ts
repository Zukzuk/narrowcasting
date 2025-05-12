import { log } from "../../utils.js";
import RandomizedListCreatedEvent, { RANDOMIZED_LIST_CREATED_EVENT } from "../../domain/events/RandomizedListCreatedEvent.js";
import broker from "../../infrastructure/BrokerSingleton.js";

/**
 * @class RandomizedListReadModel
 */
export default class RandomizedListReadModel {

    private cache: Record<string, any> = {};

    constructor() {
        // subscribe to events
        log('RandomizedListReadModel.constructor()', 'subscribe', `
            \t${RANDOMIZED_LIST_CREATED_EVENT}
        `);
        broker.sub(RANDOMIZED_LIST_CREATED_EVENT, event => {
            log('RandomizedListReadModel.sub()', 'listen', `${event.type}: randomized list recieved`);
            this.#denormalize(event);
        });
    }

    // TODO: Implement userId cache

    /**
     * @returns {Record<string, any>}
     */
    query({ userId }: { userId: string }): Record<string, any> {
        const payload = this.cache || {};

        log('RandomizedListReadModel.query()', 'read', `directory tree`, userId);

        return payload;
    }

    /**
     * This method denormalizes the LibraryDirectoryTree domain events.
     * 
     * @private 
     */
    #denormalize(event: RandomizedListCreatedEvent) {
        this.cache = event.weightedList;
    }
}
