import { log } from "../../../utils.js";
import CrawlCompletedEvent, { CRAWL_COMPLETED_EVENT } from "../../../domain/events/CrawlCompletedEvent.js";

import broker from "../../../infrastructure/Broker.js";

export interface IComicsCrawlQuery { 
    userId: string, 
    endpoint: string, 
    search: string 
};

/**
 * This class is responsible for handling the read model of the ComicsCrawl domain.
 * 
 * @class ComicsCrawlReadModel
 */
export default class ComicsCrawlReadModel {

    private cache: Record<string, any> = {};

    constructor() {
        // subscribe to events
        log('ComicsCrawlReadModel.constructor', 'subscribe', `
            \t${CRAWL_COMPLETED_EVENT}
        `);
        broker.sub(CRAWL_COMPLETED_EVENT, event => {
            log('ComicsCrawlReadModel', 'listen', `${event.type}: '${event.endpoint}' in '${event.mediaType}'`);
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

        log('ComicsCrawlReadModel.query', 'read', `${ endpoint } with search '${ search }'`, userId);

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
