import CrawlComicsCommand from '../../commands/CrawlComicsCommand.js';
import CrawledKomgaAggregateRoot from './CrawledKomgaAggregateRoot.js';
import { log } from '../../../utils.js';

type TCrawlEndpoints = {
    series: Record<string, string>;
    collections: Record<string, string>;
};

/**
 * This repository is used to store the crawled comics data from Komga.
 * 
 * @class CrawledKomgaRepository
 */
export default class CrawledKomgaRepository {
    private cache: { [userId: string]: TCrawlEndpoints } = {};

    constructor() { }

    /**
     * Retrieve the data from the cache.
     * 
     * @param {CrawlComicsCommand} command
     * @returns {Promise<CrawledKomgaAggregateRoot>}
     */
    async read(command: CrawlComicsCommand): Promise<CrawledKomgaAggregateRoot> {
        const userCache = this.#getUserCache(command);
        const crawledComics = new CrawledKomgaAggregateRoot();
        crawledComics.set(userCache[command.payload.endpoint]);

        if (userCache) log('CrawledKomgaRepository.retrieve', command.payload.endpoint, `${Object.keys(userCache).length} items`);

        return crawledComics;
    }

    /**
     * Commit the data to the cache.
     * 
     * @param {CrawlComicsCommand} command
     * @param {CrawledKomgaAggregateRoot} crawledComics
     * @returns {Promise<CrawledKomgaAggregateRoot>}
     */
    async write(command: CrawlComicsCommand, crawledComics: CrawledKomgaAggregateRoot): Promise<CrawledKomgaAggregateRoot> {
        const endpoint = command.payload.endpoint;
        const userCache = this.#getUserCache(command);

        try {
            crawledComics.getUncommittedData().forEach((item: any) => {
                userCache[endpoint][item.id] = item.name;
            });

            log('CrawledKomgaRepository.save', endpoint, `${Object.keys(userCache).length} items`);

            crawledComics.commit(command, userCache[endpoint]);
            return crawledComics;
        } catch (error: any) {
            crawledComics.commit(command, undefined, error as Error);
            return crawledComics;
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
        const userId = command.payload.userId;

        if (!this.cache[userId]) {
            this.cache[userId] = {
                series: {},
                collections: {},
            };
        }
        // APP_CACHE_DURATION
        return this.cache[userId];
    }
}
