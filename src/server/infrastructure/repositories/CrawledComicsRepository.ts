/**
 * This repository is used to store the crawled comics data.
 * 
 * @export
 * @class CrawledComicsRepository
 */
export default class CrawledComicsRepository {
    private cache: Record<string, Record<string, string>>;

    constructor() {
        this.cache = {};
    }

    // TODO: Add userId logic

    /**
     * Save the data in the cache.
     * 
     * @param {string} endpoint
     * @param {*} data
     * @returns {Record<string, string>}
     * @memberof CrawledComicsRepository
     */
    save(endpoint: string, data: any): Record<string, string> {
        if (!this.cache[endpoint]) this.cache[endpoint] = {};
        data.forEach((item: any) => {
            this.cache[endpoint][item.id] = item.name;
        });
        const payload = this.cache[endpoint];

        this.log('save', endpoint, payload);

        return payload;
    }

    /**
     * Retrieve the data from the cache.
     * 
     * @param {string} endpoint
     * @returns {Record<string, string>}
     * @memberof CrawledComicsRepository
     */
    retrieve(endpoint: string): Record<string, string> {
        const payload = this.cache[endpoint] || null;

        if (payload) this.log('retrieve', endpoint, payload);

        return payload;
    }

    log(action: string, endpoint: string, payload: Record<string, string>) {
        console.log(`CrawledComicsRepository (old logging): ${action} -> ${Object.keys(payload).length} items for '${endpoint}'`);
    }
}
