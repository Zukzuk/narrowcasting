import ImageRetrievalFailedEvent from "../../domain/shared/events/ImageRetrievalFailedEvent.js";
import RandomImageSelectionFailedEvent from "../../domain/shared/events/RandomImageSelectionFailedEvent.js";
import CrawlFailedEvent from "../../domain/shared/events/CrawlFailedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ErrorReadModel {
    
    private errors: any[];

    constructor() {
        this.errors = [];
        // subscribe to events
        broker.sub(CrawlFailedEvent.type, event => {
            console.log('ErrorReadModel: listen ->', event.type);
            this.#denormalize(event);
        });
        broker.sub(ImageRetrievalFailedEvent.type, event => {
            console.log('ErrorReadModel: listen ->', event.type);
            this.#denormalize(event);
        });
        broker.sub(RandomImageSelectionFailedEvent.type, event => {
            console.log('ErrorReadModel: listen ->', event.type);
            this.#denormalize(event);
        });
    }

    query(): any[] {
        console.log('ErrorReadModel: query -> errors');

        return this.errors;
    }
    
    // Method to clear logged errors
    clear() {
        this.errors = [];
    }

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