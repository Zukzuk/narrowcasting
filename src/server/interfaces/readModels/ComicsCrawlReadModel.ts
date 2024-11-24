import CrawlCompletedEvent from "../../domain/comics/events/CrawlCompletedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ComicsCrawlReadModel {
    private cache: Record<string, any>;

    constructor() {
        this.cache = {};
        // subscribe to events
        broker.sub(CrawlCompletedEvent.type, event => this.#denormalize(event));
    }

    #denormalize(event: CrawlCompletedEvent) {
        console.log('ComicsCrawlReadModel:', event.type, event.endpoint);
        // denormalize
        this.cache[event.endpoint] = event.payload;
    }

    query({ endpoint, search }: { endpoint: string, search: string }): Record<string, any> {
        const payload = this.cache[endpoint] || {};
        if (!search) return payload;
        // Create a case-insensitive fuzzy matching pattern allowing for variations
        const pattern = new RegExp(search.split(" ").join(".*"), "i");
        // Filter the payload with generalized fuzzy matching
        return Object.keys(payload)
            .filter(key => pattern.test(payload[key]))
            .reduce((acc: Record<string, any>, key) => {
                acc[key] = payload[key];
                return acc;
            }, {});
    }
}
