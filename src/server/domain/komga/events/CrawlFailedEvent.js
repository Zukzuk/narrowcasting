const CrawlFailedEventType = 'CrawlFailedEvent';

class CrawlFailedEvent {
    constructor({ endpoint, url, error, timestamp }) {
        this.type = CrawlFailedEventType;
        this.endpoint = endpoint,
        this.url = url,
        this.error = error;
        this.timestamp = timestamp;
    }
}

export {
    CrawlFailedEvent,
    CrawlFailedEventType,
}
