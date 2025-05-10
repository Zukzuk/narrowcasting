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
        const userCache = this.#getUserCache(command);
        this.crawl = new CrawlKomgaAggregateRoot();
        this.crawl.set(userCache[endpoint]);

        if (userCache) log('CrawlKomgaRepository.retrieve()', 'read', `${Object.keys(userCache).length} items crawled on '${endpoint}'`);

        return this.crawl;
    }

    /**
     * Commit the data to the cache and update the aggregate.
     * 
     * @param {CrawlComicsCommand} command
     * @param {CrawledKomgaAggregateRoot} crawl
     * @returns {Promise<CrawledKomgaAggregateRoot>}
     */
    async commit(command: CrawlComicsCommand): Promise<CrawlKomgaAggregateRoot> {
        const { endpoint } = command.payload;

        try {
            // Save the uncommitted data to the cache.
            const uncommittedData = this.crawl.getUncommittedData();
            if (uncommittedData) {
                this.#setUserCache(command, uncommittedData);
                // Update the aggregate.
                const userCache = this.#getUserCache(command);
                await this.crawl.update(command, userCache[endpoint]);
                log('CrawlKomgaRepository.commmit()', 'write', `${Object.keys(userCache).length} items for '${endpoint}'`);
            }

            return this.crawl;
        } catch (error: any) {
            // Update the aggregate with the error.
            this.crawl.update(command, undefined, error as Error);
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
    #getUserCache(command: CrawlComicsCommand): TCrawlEndpoints {
        const { userId } = command.payload;

        if (!this.cache[userId]) {
            this.cache[userId] = {
                series: {},
                collections: {},
            };
        }

        return this.cache[userId];
    }

    /**
     * Get the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @param {TImageData | null} uncommittedData
     */
    #setUserCache(command: CrawlComicsCommand, uncommittedData: any): void {
        const { userId, endpoint } = command.payload;
        if (this.cache[userId]) {
            uncommittedData.forEach((item: any) => {
                this.cache[userId][endpoint][item.id] = item.name;
            });
        }
    }
}
