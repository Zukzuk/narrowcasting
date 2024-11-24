import ImageRetrievalFailedEvent from "server/domain/comics/events/ImageRetrievalFailedEvent.js";
import CrawlFailedEvent from "../../domain/comics/events/CrawlFailedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ErrorReadModel {
    private errors: any[];

    constructor() {
        this.errors = [];
        // subscribe to events
        broker.sub(CrawlFailedEvent.type, event => this.#denormalize(event));
        broker.sub(ImageRetrievalFailedEvent.type, event => this.#denormalize(event));
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
        return this.errors;
    }
    
    // Method to clear logged errors
    clear() {
        this.errors = [];
    }
}