const CrawlAggregateRoot = require('./CrawlAggregateRoot');

class AggregateFactory {
    constructor(repository) {
        this.repository = repository; // Inject shared repository
    }

    createCrawlAggregate() {
        // Create and return a new instance of the CrawlAggregateRoot
        // Pass the shared repository to ensure consistent state
        return new CrawlAggregateRoot(this.repository);
    }
}

module.exports = AggregateFactory;