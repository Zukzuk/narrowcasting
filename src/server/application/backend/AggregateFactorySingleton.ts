import { APP_CACHE_DURATION } from '../../config.js';
import CrawledComicsRepository from '../../infrastructure/repositories/CrawledComicsRepository.js';
import ImageSetRepository from '../../infrastructure/repositories/ImageIndexRepository.js';
import CrawlComicsAggregateRoot from '../../domain/comics/CrawlComicsAggregateRoot.js';
import RetrieveComicImageAggregateRoot from '../../domain/comics/RetrieveComicImageAggregateRoot.js';
import RetrieveMediaCoverAggregateRoot from '../../domain/media/RetrieveMediaCoverAggregateRoot.js';
import SelectRandomImageAggregateRoot from '../../domain/shared/SelectRandomImageAggregateRoot.js';
import RetrieveGamesCoverAggregateRoot from '../../domain/games/RetrieveGamesCoverAggregateRoot.js';

class AggregateFactorySingleton {
    
    constructor(
        private crawledComicsRepository: CrawledComicsRepository,
        private imageSetRepository: ImageSetRepository,
    ) { }
    
    createSelectRandomImage(): SelectRandomImageAggregateRoot {
        return new SelectRandomImageAggregateRoot(this.imageSetRepository);
    }

    createRetrieveComicImage(): RetrieveComicImageAggregateRoot {
        return new RetrieveComicImageAggregateRoot();
    }

    createRetrieveMediaCover(): RetrieveMediaCoverAggregateRoot {
        return new RetrieveMediaCoverAggregateRoot(this.imageSetRepository);
    }
   
    createRetrieveGamesImage(): RetrieveGamesCoverAggregateRoot {        
        return new RetrieveGamesCoverAggregateRoot(this.imageSetRepository);
    }
    
    createCrawlComics(): CrawlComicsAggregateRoot {        
        return new CrawlComicsAggregateRoot(this.crawledComicsRepository);
    }
}

export default new AggregateFactorySingleton(
    new CrawledComicsRepository(),
    new ImageSetRepository(APP_CACHE_DURATION),
); // Singleton instance through ES6 module caching