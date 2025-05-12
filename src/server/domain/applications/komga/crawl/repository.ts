import CrawlComicsCommand from '../../../commands/CrawlComicsCommand.js';
import CrawlKomgaAggregateRoot from './aggregate.js';
import { log } from '../../../../utils.js';

type TCrawlEndpoints = {
    series: Record<string, string>;
    collections: Record<string, string>;
};

/**
 * This repository is used to store the crawled comics data from Komga.
 * 
 * @class CrawlKomgaRepository
 */
export default class CrawlKomgaRepository {
    private cache: { [userId: string]: TCrawlEndpoints } = {};
    private crawl: CrawlKomgaAggregateRoot = undefined as any;

    constructor() {}

    /**
     * Retrieve data from the cache and return the aggregate.
     * 
     * @param {CrawlComicsCommand} command
     * @returns {Promise<CrawlKomgaAggregateRoot>}
     */
    async get(command: CrawlComicsCommand): Promise<CrawlKomgaAggregateRoot> {
        const { endpoint } = command.payload;

        const _cache = this.#read(command);
        this.crawl = new CrawlKomgaAggregateRoot(command);
        this.crawl.set(_cache);

        if (_cache) log('CrawlKomgaRepository.get()', 'read', `${Object.keys(_cache).length} items crawled on '${endpoint}'`);
        return this.crawl;
    }

    /**
     * Commit the data to the cache and update the aggregate.
     * 
     * @param {CrawlComicsCommand} command
     * @returns {Promise<CrawledKomgaAggregateRoot>}
     */
    async commit(command: CrawlComicsCommand): Promise<CrawlKomgaAggregateRoot> {
        const { endpoint } = command.payload;

        try {
            // Save the uncommitted data to the cache.
            const uncommittedData = this.crawl.getUncommittedData();
            if (uncommittedData) {
                this.#update(command, uncommittedData);
                // Update the aggregate.
                const _cache = this.#read(command);
                await this.crawl.update(_cache);
                log('CrawlKomgaRepository.commmit()', 'write', `${Object.keys(_cache).length} items for '${endpoint}'`);
            }
            return this.crawl;
        } catch (error: any) {
            // Update the aggregate with the error.
            this.crawl.update(undefined, error as Error);
            return this.crawl;
        }
    }

    /**
     * Get the user's cache.
     * 
     * @private
     * @param {CrawlComicsCommand} command
     * @returns {TCrawlEndpoints}
     */
    #read(command: CrawlComicsCommand): Record<string, string> {
        const { userId, endpoint } = command.payload;            
        return this.cache[userId][endpoint];
    }

    /**
     * Update the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @param {any | null} uncommittedData
     */
    #update(command: CrawlComicsCommand, uncommittedData: any): void {
        const { userId, endpoint } = command.payload;
        uncommittedData.forEach((item: any) => {
            if (!this.cache[userId]) this.cache[userId] = { series: {}, collections: {} };
            if (!this.cache[userId][endpoint]) this.cache[userId][endpoint] = {};
            this.cache[userId][endpoint][item.id] = item.name;
        });
    }
}
