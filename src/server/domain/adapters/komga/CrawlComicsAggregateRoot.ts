
import { KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE } from '../../../config.js';
import CrawledComicsRepository from '../../../infrastructure/repositories/CrawledComicsRepository.js';
import CrawlCommand from '../../../domain/shared/commands/CrawlCommand.js';
import CrawlCompletedEvent from '../../../domain/shared/events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../../../domain/shared/events/CrawlFailedEvent.js';
import CrawlComicsEndpointService from './services/CrawlComicsEndpointService.js';
import { TMediaType } from '../../shared/types/index.js';

/**
 * Aggregate root for crawling comics from Komga.
 * 
 * @export
 * @class CrawlComicsAggregateRoot
 */
export default class CrawlComicsAggregateRoot {
    
    private crawlComicsEndpointService: CrawlComicsEndpointService;
    private mediaType: TMediaType = 'comics';

    constructor(private repository: CrawledComicsRepository) {
        this.crawlComicsEndpointService = new CrawlComicsEndpointService(KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE);
    }

    /**
     * Consume a crawl command.
     * 
     * @param {CrawlCommand} command
     * @returns {Promise<CrawlCompletedEvent | CrawlFailedEvent>}
     * @memberof CrawlComicsAggregateRoot
     */
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
            return new CrawlCompletedEvent(payload, endpoint, this.mediaType);
        } catch (error: any) {
            // Return failure event
            const event = new CrawlFailedEvent(error.message || error, endpoint, error.url, this.mediaType);
            error.event = event;
            return event;
        }
    }
}
