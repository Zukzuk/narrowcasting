import { APP_CACHE_DURATION } from '../../config.js';
import CrawledComicsRepository from '../../infrastructure/repositories/CrawledComicsRepository.js';
import ImageIndexRepository from '../../infrastructure/repositories/ImageIndexRepository.js';
import CrawlComicsAggregateRoot from '../../domain/adapters/komga/CrawlComicsAggregateRoot.js';
import RetrieveComicImageAggregateRoot from '../../domain/adapters/komga/RetrieveComicImageAggregateRoot.js';
import RetrieveMediaCoverAggregateRoot from '../../domain/adapters/plex/RetrieveMediaCoverAggregateRoot.js';
import RetrieveGamesCoverAggregateRoot from '../../domain/adapters/playnite/RetrieveGamesCoverAggregateRoot.js';
import SelectRandomImageAggregateRoot from '../../domain/narrowcasting/SelectRandomImageAggregateRoot.js';

class AggregateFactorySingleton {
    
    constructor(
        private crawledComicsRepository: CrawledComicsRepository,
        private imageIndexRepository: ImageIndexRepository,
    ) { }
    
    createSelectRandomImage(): SelectRandomImageAggregateRoot {
        return new SelectRandomImageAggregateRoot(this.imageIndexRepository);
    }

    createRetrieveComicImage(): RetrieveComicImageAggregateRoot {
        return new RetrieveComicImageAggregateRoot();
    }

    createRetrieveMediaCover(): RetrieveMediaCoverAggregateRoot {
        return new RetrieveMediaCoverAggregateRoot(this.imageIndexRepository);
    }
   
    createRetrieveGamesImage(): RetrieveGamesCoverAggregateRoot {        
        return new RetrieveGamesCoverAggregateRoot(this.imageIndexRepository);
    }
    
    createCrawlComics(): CrawlComicsAggregateRoot {        
        return new CrawlComicsAggregateRoot(this.crawledComicsRepository);
    }
}

export default new AggregateFactorySingleton(
    new CrawledComicsRepository(),
    new ImageIndexRepository(APP_CACHE_DURATION),
); // Singleton instance through ES6 module caching