import { log } from "../../utils.js";
import LibraryTraversedEvent, { LIBRARY_TRAVERSED_EVENT } from "../../domain/events/LibraryTraversedEvent.js";
import broker from "../../infrastructure/BrokerSingleton.js";

/**
 * @class LibraryDirectoryTreeReadModel
 */
export default class LibraryDirectoryTreeReadModel {

    private cache: Record<string, any> = {};

    constructor() {
        // subscribe to events
        log('LibraryDirectoryTreeReadModel.constructor()', 'subscribe', `
            \t${LIBRARY_TRAVERSED_EVENT}
        `);
        broker.sub(LIBRARY_TRAVERSED_EVENT, event => {
            log('Broker.sub()', 'listen', `${event.type}: directory tree recieved`);
            this.#denormalize(event);
        });
    }

    // TODO: Implement userId cache

    /**
     * @returns {Record<string, any>}
     */
    query({ userId }: { userId: string }): Record<string, any> {
        const payload = this.cache || {};

        log('LibraryDirectoryTreeReadModel.query()', 'read', `directory tree`, userId);

        return payload;
    }

    /**
     * This method denormalizes the LibraryDirectoryTree domain events.
     * 
     * @private 
     */
    #denormalize(event: LibraryTraversedEvent) {
        this.cache = event.payload;
    }
}
