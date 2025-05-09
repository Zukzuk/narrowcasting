import CrawlComicsCommand from '../../../commands/CrawlComicsCommand.js';
import CrawlKomgaEndpointService from './CrawlKomgaEndpointService.js';
import CrawlCompletedEvent from '../../../events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../../../events/CrawlFailedEvent.js';
import { log, UrlError } from '../../../../utils.js';
import { TMediaType } from '../../../types/index.js';

export default class CrawledKomgaAggregateRoot {
    private mediaType: TMediaType = 'comics';
    private data: Record<string, string> = {};
    private uncommittedData: any = null;
    private raisedEvents: Array<CrawlCompletedEvent | CrawlFailedEvent> = [];

    private crawlKomgaEndpointService: CrawlKomgaEndpointService;

    constructor() {
        this.crawlKomgaEndpointService = new CrawlKomgaEndpointService();
    }

    set(data: Record<string, string>): void {
        this.data = data;
    }

    get(): Record<string, string> | null {
        return this.data;
    }

    hasValidData(): boolean {
        return !!Object.keys(this.data).length;
    }

    async crawl(command: CrawlComicsCommand): Promise<void> {
        const endpoint = command.payload.endpoint;

        try {
            this.uncommittedData = await this.crawlKomgaEndpointService.crawl(endpoint);
        } catch (error: any) {
            error = error as UrlError;
            const event = new CrawlFailedEvent(error.message || error, endpoint, this.mediaType, error.url);
            this.uncommittedData = null;
            this.raisedEvents.push(event);
        }
    }

    getUncommittedData(): any {
        return this.uncommittedData;
    }

    commit(command: CrawlComicsCommand, payload?: Record<string, string>, error?: Error): void {
        const endpoint = command.payload.endpoint;

        if (error) {
            const event = new CrawlFailedEvent(error.message || error, endpoint, this.mediaType);
            this.raisedEvents.push(event);
        } else if (payload) {
            const event = new CrawlCompletedEvent(payload, endpoint, this.mediaType);
            this.raisedEvents.push(event);
        }
        
        this.uncommittedData = null;
    }

    getRaisedEvents(): Array<CrawlCompletedEvent | CrawlFailedEvent> {
        return this.raisedEvents;
    }
}