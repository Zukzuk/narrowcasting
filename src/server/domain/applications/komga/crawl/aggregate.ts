import CrawlComicsCommand from '../../../commands/CrawlComicsCommand.js';
import CrawlCompletedEvent from '../../../events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../../../events/CrawlFailedEvent.js';
import CrawlKomgaEndpointService from './crawl-endpoint.service.js';
import { log, UrlError } from '../../../../utils.js';
import { TMediaType } from '../../../types/index.js';

export default class CrawlKomgaAggregateRoot {
    private mediaType: TMediaType = 'comics';
    private data: Record<string, string> | null = null;
    private uncommittedData: any | null = null;
    private raisedEvents: Array<CrawlCompletedEvent | CrawlFailedEvent> = [];

    private service: CrawlKomgaEndpointService;

    constructor() {
        this.service = new CrawlKomgaEndpointService();
    }

    set(data: Record<string, string>): void {
        this.data = data;
    }

    get(): Record<string, string> | null {
        return this.data;
    }

    isEmpty(): boolean {
        return this.data === null || Object.keys(this.data).length === 0;
    }

    isStale(): boolean {
        return false; // this.data.timestamp < Date.now() - APP_CACHE_DURATION;
    }

    hasUncommittedData(): boolean {
        return this.uncommittedData !== null && !!Object.keys(this.uncommittedData).length;
    }

    getUncommittedData(): any | null {
        return this.uncommittedData;
    }

    getRaisedEvents(): Array<CrawlCompletedEvent | CrawlFailedEvent> {
        return this.raisedEvents;
    }

    async execute(command: CrawlComicsCommand): Promise<void> {
        const { endpoint } = command.payload;

        try {
            this.uncommittedData = await this.service.crawl(endpoint);
        } catch (error: any) {
            this.uncommittedData = null;
            error = error as UrlError;

            const event = new CrawlFailedEvent(error, endpoint, this.mediaType, error.url);
            this.raisedEvents.push(event);
        }
    }

    async update(command: CrawlComicsCommand, payload?: Record<string, string>, error?: Error): Promise<void> {
        const { endpoint } = command.payload;

        if (error) {
            const event = new CrawlFailedEvent(error, endpoint, this.mediaType);
            this.raisedEvents.push(event);
        } else if (payload) {
            const event = new CrawlCompletedEvent(payload, endpoint, this.mediaType);
            this.raisedEvents.push(event);
        }

        this.data = payload || null;
        this.uncommittedData = null;
    }
}