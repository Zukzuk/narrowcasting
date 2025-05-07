
import { KOMGA_API, KOMGA_AUTH, APP_CRAWL_PAGE_SIZE } from '../../../config.js';
import CrawledComicsRepository from './CrawledComicsRepository.js';
import CrawlEndpointCommand from '../../commands/CrawlEndpointCommand.js';
import CrawlCompletedEvent from '../../events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../../events/CrawlFailedEvent.js';
import { TMediaType } from '../../types/index.js';
import CrawlComicsEndpointService from './services/CrawlComicsEndpointService.js';

/**
 * Aggregate root for crawling comics from Komga.
 * 
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
     * @param {CrawlEndpointCommand} command
     * @returns {Promise<CrawlCompletedEvent | CrawlFailedEvent>}
     * @memberof CrawlComicsAggregateRoot
     */
    async consume(command: CrawlEndpointCommand): Promise<CrawlCompletedEvent | CrawlFailedEvent> {
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
