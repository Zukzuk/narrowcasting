import ImageRetrievalFailedEvent from "../../domain/shared/events/ImageRetrievalFailedEvent.js";
import RandomImageSelectionFailedEvent from "../../domain/shared/events/RandomImageSelectionFailedEvent.js";
import CrawlFailedEvent from "../../domain/shared/events/CrawlFailedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

/**
 * This class is responsible for handling the read model of the Error domain.
 * 
 * @export
 * @class ErrorReadModel
 */
export default class ErrorReadModel {
    
    private errors: any[] = [];

    constructor() {
        this.errors = [];
        // subscribe to events
        broker.sub(CrawlFailedEvent.type, event => {
            console.log('ErrorReadModel:: logging: listen ->', event.type);
            this.#denormalize(event);
        });
        broker.sub(ImageRetrievalFailedEvent.type, event => {
            console.log('ErrorReadModel:: logging: listen ->', event.type);
            this.#denormalize(event);
        });
        broker.sub(RandomImageSelectionFailedEvent.type, event => {
            console.log('ErrorReadModel:: logging: listen ->', event.type);
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
        console.log('ErrorReadModel:: query: read -> errors');

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
     * @param {CrawlFailedEvent | ImageRetrievalFailedEvent | RandomImageSelectionFailedEvent} event
     * @memberof ErrorReadModel
     */
    #denormalize(
        event: 
            CrawlFailedEvent | 
            ImageRetrievalFailedEvent |
            RandomImageSelectionFailedEvent
        ) {
        this.errors.push(event);
        console.log(JSON.stringify(event, null, 2));
    }
}