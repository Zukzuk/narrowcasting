import CrawledComicsRepository from '../infrastructure/repositories/CrawledComicsRepository.js';
import CrawlComicsAggregateRoot from '../domain/comics/CrawlComicsAggregateRoot.js';
import RandomComicImageAggregateRoot from '../domain/comics/RandomComicImageAggregateRoot.js';
import RandomMediaCoverAggregateRoot from '../domain/media/RandomMediaCoverAggregateRoot.js';
import ComicsImageSetRepository from '../infrastructure/repositories/ComicsImageSetRepository.js';
import MediaImageSetRepository from '../infrastructure/repositories/MediaImageSetRepository.js';
import { APP_CACHE_DURATION } from '../config.js';

class AggregateFactory {
    private crawledComicsRepository: CrawledComicsRepository;
    private comicsImageSetRepository: ComicsImageSetRepository;
    private mediaImageSetRepository: MediaImageSetRepository;

    constructor() {
        this.crawledComicsRepository = new CrawledComicsRepository();
        this.comicsImageSetRepository = new ComicsImageSetRepository(APP_CACHE_DURATION);
        this.mediaImageSetRepository = new MediaImageSetRepository(APP_CACHE_DURATION);
    }

    // Pass the shared repository to ensure consistent state

    createCrawlComics(): CrawlComicsAggregateRoot {        
        return new CrawlComicsAggregateRoot(this.crawledComicsRepository);
    }

    createRandomComicImage(): RandomComicImageAggregateRoot {
        return new RandomComicImageAggregateRoot(this.comicsImageSetRepository);
    }

    createRandomMediaCover(): RandomMediaCoverAggregateRoot {
        return new RandomMediaCoverAggregateRoot(this.mediaImageSetRepository);
    }
}

export default new AggregateFactory();