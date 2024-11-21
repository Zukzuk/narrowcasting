const CrawlCommandType = 'CrawlCommand';

class CrawlCommand {
    constructor({ payload, timestamp }) {
        this.type = CrawlCommandType;
        this.payload = payload;
        this.timestamp = timestamp;
    }
}

export {
    CrawlCommand,
    CrawlCommandType,
}
