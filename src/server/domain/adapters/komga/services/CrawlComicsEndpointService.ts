import axios, { AxiosBasicCredentials } from 'axios';
import { UrlError } from '../../../../utils.js';

/**
 * Service for crawling comics from Komga.
 * 
 * @class CrawlComicsEndpointService
 * @export
 */
export default class CrawlComicsEndpointService {

    constructor(
        private KOMGA_API: string, 
        private KOMGA_AUTH: AxiosBasicCredentials, 
        private APP_CRAWL_PAGE_SIZE: number
    ) {}

    /**
     * Crawl a Komga endpoint.
     * 
     * @param {string} endpoint
     * @returns {Promise<any[]>}
     * @memberof CrawlComicsEndpointService
     */
    async crawl(endpoint: string): Promise<any[]> {
        // Initialize to 1 as a default, will be updated after the first fetch
        let totalPages = 1;
        const data = [];
        for (let page = 0; page < totalPages; page++) {
            const { content, totalPages: fetchedTotalPages } = await this.#fetchPage(page, endpoint);
            if (page === 0) totalPages = fetchedTotalPages;
            data.push(...content);
        }
        return data;
    }

    /**
     * Fetch a page from a Komga endpoint.
     * 
     * @private
     * @param {number} page
     * @param {string} endpoint
     * @returns {Promise<{ content: any[], totalPages: number }>}
     * @memberof CrawlComicsEndpointService
     */
    async #fetchPage(page: number, endpoint: string): Promise<{ content: any[], totalPages: number }> {
        const url = `${this.KOMGA_API}/${endpoint}?size=${this.APP_CRAWL_PAGE_SIZE}&page=${page}`;
        try {
            const { data } = await axios.get(url, { auth: this.KOMGA_AUTH });
            return data;
        } catch (error: any) {
            throw new UrlError(error.message, url);
        }
    }
}