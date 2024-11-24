import CrawlFailedEvent from "../../domain/comics/events/CrawlFailedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ErrorReadModel {
    private errors: any[];

    constructor() {
        this.errors = [];
        // subscribe to events
        broker.sub(CrawlFailedEvent.type, event => this.#denormalize(event));
    }

    #denormalize(event: CrawlFailedEvent) {
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