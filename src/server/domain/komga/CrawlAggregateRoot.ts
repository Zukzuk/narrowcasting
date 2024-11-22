import { CrawlCompletedEvent } from './events/CrawlCompletedEvent.js';
import { CrawlFailedEvent } from './events/CrawlFailedEvent.js';
import CrawlEndpoint from './services/CrawlEndpoint.js';
import { KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE } from '../../config.js';
import CacheRepository from '../../infrastructure/repositories/CacheRepository.js';
import { CrawlCommand } from './commands/CrawlCommand.js';

class CrawlAggregateRoot {
    private crawlEndpoint: CrawlEndpoint;

    constructor(private repository: CacheRepository) {
        this.crawlEndpoint = new CrawlEndpoint(KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE);
    }

    async aggregate(command: CrawlCommand): Promise<CrawlCompletedEvent | CrawlFailedEvent> {
        const { endpoint } = command.payload;
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
        } catch (error: any) {
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
