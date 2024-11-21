import axios from 'axios';

class CrawlEndpoint {
    constructor({KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE}) {
        this.KOMGA_API = KOMGA_API;
        this.KOMGA_AUTH = KOMGA_AUTH;
        this.APP_CRAWL_PAGE_SIZE = APP_CRAWL_PAGE_SIZE;
    }

    async crawl(endpoint) {
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

    async #fetchPage(page, endpoint) {
        const url = `${this.KOMGA_API}/${endpoint}?size=${this.APP_CRAWL_PAGE_SIZE}&page=${page}`;
        try {
            const { data } = await axios.get(url, { auth: this.KOMGA_AUTH });
            return data;
        } catch (error) {
            const errorEvent = new Error(error.message);
            errorEvent.url = url;
            throw errorEvent;
        }
    }
}

export default CrawlEndpoint;