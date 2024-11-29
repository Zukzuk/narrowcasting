import ImageRetrievalFailedEvent from "../../domain/shared/events/ImageRetrievalFailedEvent.js";
import CrawlFailedEvent from "../../domain/comics/events/CrawlFailedEvent.js";

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
    }

    #denormalize(
        event: 
            CrawlFailedEvent | 
            ImageRetrievalFailedEvent
        ) {
        this.errors.push(event);
        console.error(JSON.stringify(event, null, 2));
    }

    query(): any[] {
        console.log('ErrorReadModel: query -> errors');

        return this.errors;
    }
    
    // Method to clear logged errors
    clear() {
        this.errors = [];
    }
}