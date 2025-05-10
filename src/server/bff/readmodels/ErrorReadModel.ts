import ImageRetrievalFailedEvent, { IMAGE_RETRIEVAL_FAILED_EVENT } from "../../domain/events/ImageRetrievalFailedEvent.js";
import RandomImageSelectionFailedEvent, { RANDOM_IMAGE_SELECTION_FAILED_EVENT } from "../../domain/events/RandomImageSelectionFailedEvent.js";
import CrawlFailedEvent, { CRAWL_FAILED_EVENT } from "../../domain/events/CrawlFailedEvent.js";
import LibraryTraversalFailedEvent, { LIBRARY_TRAVERSAL_FAILED_EVENT } from "../../domain/events/LibraryTraversalFailedEvent.js";
import HandlerFailedEvent, { HANDLER_FAILED_EVENT } from "../../domain/events/HandlerFailedEvent.js";
import { log } from "../../utils.js";

import broker from "../../infrastructure/BrokerSingleton.js";

/**
 * This class is responsible for handling the read model of the Error domain.
 * 
 * @class ErrorReadModel
 */
export default class ErrorReadModel {
    
    private errors: any[] = [];

    constructor() {
        this.errors = [];
        // subscribe to events
        log('ErrorReadModel.constructor', 'subscribe', `
            \t${CRAWL_FAILED_EVENT}
            \t${HANDLER_FAILED_EVENT}
            \t${IMAGE_RETRIEVAL_FAILED_EVENT}
            \t${RANDOM_IMAGE_SELECTION_FAILED_EVENT}
            \t${LIBRARY_TRAVERSAL_FAILED_EVENT}
        `);
        broker.sub([
            CRAWL_FAILED_EVENT, 
            HANDLER_FAILED_EVENT, 
            IMAGE_RETRIEVAL_FAILED_EVENT,
            RANDOM_IMAGE_SELECTION_FAILED_EVENT,
            LIBRARY_TRAVERSAL_FAILED_EVENT
        ], event => {
            log('ErrorReadModel', 'listen', `${event.type}: ${event.error?.message}`);
            this.#denormalize(event);
        });
    }

    /**
     * This method queries the read model for the Error domain.
     * 
     * @returns {any[]}
     * @memberof ErrorReadModel
     */
    query(): any[] {
        log('ErrorReadModel.query', 'read', `${this.errors.length} errors`);

        return this.errors;
    }
    
    /**
     * This method clears the read model for the Error domain.
     * 
     * @memberof ErrorReadModel
     */
    clear() {
        this.errors = [];
    }

    /**
     * This method denormalizes the Error domain events.
     * 
     * @private
     * @param {
     *      | CrawlFailedEvent 
     *      | HandlerFailedEvent 
     *      | ImageRetrievalFailedEvent
     *      | RandomImageSelectionFailedEvent
     *      | LibraryTraversalFailedEvent
     * } event
     * @memberof ErrorReadModel
     */
    #denormalize(
        event: 
            | CrawlFailedEvent 
            | HandlerFailedEvent
            | ImageRetrievalFailedEvent
            | RandomImageSelectionFailedEvent
            | LibraryTraversalFailedEvent
        ) {
        this.errors.push(event);
        console.warn(JSON.stringify(event.error, null, 2));
    }
}