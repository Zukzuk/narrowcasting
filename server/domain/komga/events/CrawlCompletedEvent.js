const CrawlCompletedEventType = 'CrawlCompletedEvent';

class CrawlCompletedEvent {
    constructor({ endpoint, totalItems, payload, timestamp }) {
        this.type = CrawlCompletedEventType;
        this.endpoint = endpoint,
        this.payload = payload;
        this.totalItems = totalItems;
        this.timestamp = timestamp;
    }
}

module.exports = {
    CrawlCompletedEvent,
    CrawlCompletedEventType,
}