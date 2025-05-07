import { APP_CACHE_DURATION } from '../config.js';
import CrawledComicsRepository from '../domain/repositories/CrawledComicsRepository.js';
import ImageIndexRepository from '../domain/repositories/ImageIndexRepository.js';
import TraversalRepository from '../domain/repositories/TraversalRepository.js';
import CrawlComicsAggregateRoot from '../domain/adapters/komga/CrawlComicsAggregateRoot.js';
import RetrieveComicsImageAggregateRoot from '../domain/adapters/komga/RetrieveComicsImageAggregateRoot.js';
import RetrieveMediaCoverAggregateRoot from '../domain/adapters/plex/RetrieveMediaCoverAggregateRoot.js';
import RetrieveGamesCoverAggregateRoot from '../domain/adapters/playnite/RetrieveGamesCoverAggregateRoot.js';
import CreateRandomizedListAggregateRoot from '../domain/narrowcasting/CreateRandomizedListAggregateRoot.js';
import SelectFromRandomizedListAggregateRoot from '../domain/narrowcasting/SelectFromImageListAggregateRoot.js';
import TraverseLibraryAggregateRoot from '../domain/narrowcasting/TraverseLibraryAggregateRoot.js';

/**
 * Singleton class that orchestrates the application backend aggregates.
 */
class AggregateFactorySingleton {
    
    constructor(
        private crawledComicsRepository: CrawledComicsRepository,
        private traversalRepository: TraversalRepository,
        private imageIndexRepository: ImageIndexRepository,
    ) {}
    
    createCreateRandomizedList(): CreateRandomizedListAggregateRoot {
        return new CreateRandomizedListAggregateRoot(this.imageIndexRepository);
    }

    createSelectFromRandomizedList(): SelectFromRandomizedListAggregateRoot {
        return new SelectFromRandomizedListAggregateRoot(this.imageIndexRepository);
    }

    createRetrieveComicsImage(): RetrieveComicsImageAggregateRoot {
        return new RetrieveComicsImageAggregateRoot();
    }

    createRetrieveMediaCover(): RetrieveMediaCoverAggregateRoot {
        return new RetrieveMediaCoverAggregateRoot(this.imageIndexRepository);
    }
   
    createRetrieveGamesCover(): RetrieveGamesCoverAggregateRoot {
        return new RetrieveGamesCoverAggregateRoot(this.imageIndexRepository);
    }
    
    createCrawlComics(): CrawlComicsAggregateRoot {
        return new CrawlComicsAggregateRoot(this.crawledComicsRepository);
    }
    
    createTraverseLibrary(): TraverseLibraryAggregateRoot {
        return new TraverseLibraryAggregateRoot(this.traversalRepository);
    }
}

export default new AggregateFactorySingleton(
    new CrawledComicsRepository(),
    new TraversalRepository(),
    new ImageIndexRepository(APP_CACHE_DURATION),
); // Singleton instance through ES6 module caching