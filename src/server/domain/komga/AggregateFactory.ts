import CacheRepository from '../../infrastructure/repositories/CacheRepository.js';
import CrawlAggregateRoot from './CrawlAggregateRoot.js';

class AggregateFactory {
    constructor(private repository: CacheRepository) {}

    createCrawlAggregate(): CrawlAggregateRoot {
        // Create and return a new instance of the CrawlAggregateRoot
        // Pass the shared repository to ensure consistent state
        return new CrawlAggregateRoot(this.repository);
    }
}

export default AggregateFactory;