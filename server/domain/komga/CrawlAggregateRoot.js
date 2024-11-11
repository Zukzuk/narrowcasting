const { CrawlCompletedEvent } = require('./events/CrawlCompletedEvent');
const { CrawlFailedEvent } = require('./events/CrawlFailedEvent');
const CrawlEndpoint = require('./services/CrawlEndpoint');
const { KOMGA_API, KOMGA_AUTH, CRAWL_PAGE_SIZE } = require('../../config');

class CrawlAggregateRoot {
    constructor(repository) {
        this.repository = repository;
        this.crawlEndpoint = new CrawlEndpoint({KOMGA_API, KOMGA_AUTH, CRAWL_PAGE_SIZE});
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

module.exports = CrawlAggregateRoot;
