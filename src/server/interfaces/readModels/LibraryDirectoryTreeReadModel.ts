import { log } from "../../utils.js";
import LibraryTraversedEvent, { LIBRARY_TRAVERSED_EVENT } from "../../domain/core/events/LibraryTraversedEvent.js";
import broker from "../../infrastructure/broker/Broker.js";

/**
 * This class is responsible for handling the read model of the LibraryDirectoryTreeReadModel domain.
 * 
 * @class LibraryDirectoryTreeReadModel
 */
export default class LibraryDirectoryTreeReadModel {

    private cache: Record<string, any> = {};

    constructor() {
        // subscribe to events
        log('LibraryDirectoryTreeReadModel.constructor', 'subscribe', `
            \t${LIBRARY_TRAVERSED_EVENT}
        `);
        broker.sub(LIBRARY_TRAVERSED_EVENT, event => {
            log('LibraryDirectoryTreeReadModel.listen', event.type, 'directory tree recieved');
            this.#denormalize(event);
        });
    }

    // TODO: Implement userId cache

    /**
     * This method queries the read model for the LibraryDirectoryTreeReadModel domain.
     * 
     * @returns {Record<string, any>}
     * @memberof LibraryDirectoryTreeReadModel
     */
    query({ userId }: { userId: string }): Record<string, any> {
        const payload = this.cache || {};

        log('LibraryDirectoryTreeReadModel.query', 'read', `directory tree`, userId);

        return payload;
    }

    /**
     * This method denormalizes the LibraryDirectoryTree domain events.
     * 
     * @private 
     * @memberof LibraryDirectoryTreeReadModel
     */
    #denormalize(event: LibraryTraversedEvent) {
        this.cache = event.payload;
    }
}
