import CrawledComicsRepository from '../infrastructure/repositories/CrawledComicsRepository.js';
import CrawlComicsAggregateRoot from './comics/CrawlComicsAggregateRoot.js';
import RandomComicImageAggregateRoot from './comics/RandomComicImageAggregateRoot.js';
import ImageRepository from '../infrastructure/repositories/ImageRepository.js';
import { APP_CACHE_DURATION } from '../config.js';

class AggregateFactory {
    private crawledComicsRepository: CrawledComicsRepository;
    private imageRepository: ImageRepository;

    constructor() {
        this.crawledComicsRepository = new CrawledComicsRepository();
        this.imageRepository = new ImageRepository(APP_CACHE_DURATION);
    }
    // Pass the shared repository to ensure consistent state

    createCrawlComics(): CrawlComicsAggregateRoot {        
        return new CrawlComicsAggregateRoot(this.crawledComicsRepository);
    }

    createRandomComicImage(): RandomComicImageAggregateRoot {
        return new RandomComicImageAggregateRoot(this.imageRepository);
    }
}

export default new AggregateFactory();