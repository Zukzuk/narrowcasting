
import { KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE } from '../../config.js';
import CrawledComicsRepository from '../../infrastructure/repositories/CrawledComicsRepository.js';
import CrawlCommand from '../../domain/comics/commands/CrawlCommand.js';
import CrawlCompletedEvent from '../../domain/comics/events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../../domain/comics/events/CrawlFailedEvent.js';
import CrawlComicsEndpointService from './services/CrawlComicsEndpointService.js';

export default class CrawlComicsAggregateRoot {
    private crawlComicsEndpointService: CrawlComicsEndpointService;
    private domain: string = 'comics';

    constructor(private repository: CrawledComicsRepository) {
        this.crawlComicsEndpointService = new CrawlComicsEndpointService(KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE);
    }

    async consume(command: CrawlCommand): Promise<CrawlCompletedEvent | CrawlFailedEvent> {
        const { endpoint } = command.payload;

        try {
            // Get the available cache
            let payload = this.repository.retrieve(endpoint);

            // Crawl if no cache is available
            if (!payload) {
                const data = await this.crawlComicsEndpointService.crawl(endpoint);
                payload = this.repository.save(endpoint, data);
            }

            // Return a business event
            return new CrawlCompletedEvent(payload, endpoint, this.repository.totalItems(), this.domain);
        } catch (error: any) {
            // Return failure event
            const event = new CrawlFailedEvent(error.message || error, endpoint, error.url, this.domain);
            error.event = event;
            throw error;
        }
    }
}
