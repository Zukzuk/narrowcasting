
import { KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE } from '../../config.js';
import CrawledComicsRepository from '../../infrastructure/repositories/CrawledComicsRepository.js';
import CrawlCommand from '../../domain/comics/commands/CrawlCommand.js';
import CrawlCompletedEvent from '../../domain/comics/events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../../domain/comics/events/CrawlFailedEvent.js';
import CrawlService from '../../domain/comics/services/CrawlService.js';

export default class CrawlComicsAggregateRoot {
    private crawlService: CrawlService;

    constructor(private repository: CrawledComicsRepository) {
        this.crawlService = new CrawlService(KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE);
    }

    async consume(command: CrawlCommand): Promise<CrawlCompletedEvent | CrawlFailedEvent> {
        const { endpoint } = command.payload;
        try {
            // Get the available cache
            let payload = this.repository.retrieve(endpoint);

            // Crawl if no cache is available
            if (!payload) {
                const data = await this.crawlService.crawl(endpoint);
                payload = this.repository.save(endpoint, data);
            }

            // Return a business event
            return new CrawlCompletedEvent({
                endpoint,
                payload,
                totalItems: this.repository.totalItems(),
                domain: 'comics',
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            // Return failure event
            const event = new CrawlFailedEvent({
                endpoint,
                url: error.url,
                error: error.message || error,
                domain: 'comics',
                timestamp: new Date().toISOString(),
            });
            error.event = event;
            throw error;
        }
    }
}
