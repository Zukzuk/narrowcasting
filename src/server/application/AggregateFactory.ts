import CrawledComicsRepository from '../infrastructure/repositories/CrawledComicsRepository.js';
import TotalComicsRepository from '../infrastructure/repositories/TotalComicsRepository.js';
import SessionRepository from '../infrastructure/repositories/SessionRepository.js';
import CrawlComicsAggregateRoot from '../domain/comics/CrawlComicsAggregateRoot.js';
import RandomComicImageAggregateRoot from '../domain/comics/RandomComicImageAggregateRoot.js';

export default class AggregateFactory {
    constructor() {}
    // Pass the shared repository to ensure consistent state

    createCrawlComics(): CrawlComicsAggregateRoot {        
        return new CrawlComicsAggregateRoot(new CrawledComicsRepository());
    }

    createRandomComicImage(): RandomComicImageAggregateRoot {
        return new RandomComicImageAggregateRoot(new TotalComicsRepository(), new SessionRepository({}));
    }
}