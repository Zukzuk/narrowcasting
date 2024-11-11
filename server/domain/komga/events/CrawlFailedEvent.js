class CrawlFailedEvent {
    constructor({ endpoint, url, error, timestamp }) {
        this.type = 'CrawlFailedEvent';
        this.endpoint = endpoint,
        this.url = url,
        this.error = error;
        this.timestamp = timestamp;
    }
}

module.exports = CrawlFailedEvent;
