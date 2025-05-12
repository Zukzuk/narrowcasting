import axios from 'axios';
import { UrlError } from '../../../../utils.js';
import { KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE } from '../../../../config.js';

/**
 * Service for crawling comics from Komga.
 * 
 * @class CrawlKomgaEndpointService
 */
export default class CrawlKomgaEndpointService {

    constructor() { }

    /**
     * Crawl a Komga endpoint.
     * 
     * @param {string} endpoint
     * @returns {Promise<any[]>}
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
     */
    async #fetchPage(page: number, endpoint: string): Promise<{ content: any[], totalPages: number }> {
        const url = `${KOMGA_API}/${endpoint}?size=${APP_CRAWL_PAGE_SIZE}&page=${page}`;
        try {
            const { data } = await axios.get(url, { auth: KOMGA_AUTH });
            return data;
        } catch (error: any) {
            throw new UrlError(error.message, url);
        }
    }
}