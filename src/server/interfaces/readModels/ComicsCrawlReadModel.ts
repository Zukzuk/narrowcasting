import { log } from "../../utils.js";
import CrawlCompletedEvent from "../../domain/shared/events/CrawlCompletedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export interface IComicsCrawlQuery { 
    userId: string, 
    endpoint: string, 
    search: string 
};

/**
 * This class is responsible for handling the read model of the ComicsCrawl domain.
 * 
 * @export
 * @class ComicsCrawlReadModel
 */
export default class ComicsCrawlReadModel {

    private cache: Record<string, any> = {};

    constructor() {
        // subscribe to events
        broker.sub(CrawlCompletedEvent.type, event => {
            console.log('ComicsCrawlReadModel:: logging: listen ->', event.type, event.endpoint, event.mediaType);
            this.#denormalize(event);
        });
    }

    // TODO: Implement userId cache

    /**
     * This method queries the read model for the ComicsCrawl domain.
     * 
     * @param {IComicsCrawlQuery} { userId, endpoint, search }
     * @returns {Record<string, any>}
     * @memberof ComicsCrawlReadModel
     */
    query({ userId, endpoint, search }: IComicsCrawlQuery): Record<string, any> {
        const payload = this.cache[endpoint] || {};
        if (!search) return payload;

        log(userId, 'ComicsCrawlReadModel', 'query', 'read', `${ endpoint } with search '${ search }'`);

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

    /**
     * This method denormalizes the ComicsCrawl domain events.
     * 
     * @private 
     * @param {CrawlCompletedEvent} event
     * @memberof ComicsCrawlReadModel
     */
    #denormalize(event: CrawlCompletedEvent) {
        this.cache[event.endpoint] = event.payload;
    }
}
