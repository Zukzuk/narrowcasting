import { CrawlCompletedEvent } from './events/CrawlCompletedEvent.js';
import { CrawlFailedEvent } from './events/CrawlFailedEvent.js';
import CrawlEndpoint from './services/CrawlEndpoint.js';
import { KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE } from '../../config.js';

class CrawlAggregateRoot {
    constructor(repository) {
        this.repository = repository;
        this.crawlEndpoint = new CrawlEndpoint({KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE});
    }

    async crawl({ endpoint }) {
        try {
            // Get the available cache
            let payload = this.repository.retrieve(endpoint);

            // Crawl if no cache is available
            if (!payload) {
                const data = await this.crawlEndpoint.crawl(endpoint);
                payload = this.repository.save(endpoint, data);
            }

            // Return a business event with detailed metadata
            return new CrawlCompletedEvent({
                endpoint,
                payload,
                totalItems: this.repository.totalItems(),
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            // Return a business error event with detailed metadata
            const event = new CrawlFailedEvent({
                endpoint,
                url: error.url,
                error: error.message || error,
                timestamp: new Date().toISOString(),
            });
            error.event = event;
            throw error;
        }
    }
}

export default CrawlAggregateRoot;
