import { APP_CACHE_DURATION } from '../config.js';
import CrawlComicsAggregateRoot from '../domain/applications/komga/CrawlComicsAggregateRoot.js';
import CrawledComicsRepository from '../domain/applications/komga/CrawledComicsRepository.js';
import RetrieveComicsImageAggregateRoot from '../domain/applications/komga/RetrieveComicsImageAggregateRoot.js';
import RetrieveMediaCoverAggregateRoot from '../domain/applications/plex/RetrieveMediaCoverAggregateRoot.js';
import RetrieveGamesCoverAggregateRoot from '../domain/applications/playnite/RetrieveGamesCoverAggregateRoot.js';
import CreateRandomizedListAggregateRoot from '../domain/applications/narrowcasting/CreateRandomizedListAggregateRoot.js';
import SelectFromRandomizedListAggregateRoot from '../domain/applications/narrowcasting/SelectFromImageListAggregateRoot.js';
import ImageIndexRepository from '../domain/applications/narrowcasting/ImageIndexRepository.js';
import TraverseLibraryAggregateRoot from '../domain/applications/craffic/TraverseLibraryAggregateRoot.js';
import TraversalRepository from '../domain/applications/craffic/TraversalRepository.js';

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