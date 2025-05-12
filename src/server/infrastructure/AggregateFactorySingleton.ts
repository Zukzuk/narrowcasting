import { APP_CACHE_DURATION } from '../config.js';
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
        private traversalRepository: TraversalRepository,
        private imageIndexRepository: ImageIndexRepository,
    ) {}
    
    createCreateRandomizedList(): CreateRandomizedListAggregateRoot {
        return new CreateRandomizedListAggregateRoot(this.imageIndexRepository);
    }

    createSelectFromRandomizedList(): SelectFromRandomizedListAggregateRoot {
        return new SelectFromRandomizedListAggregateRoot(this.imageIndexRepository);
    }
    
    createTraverseLibrary(): TraverseLibraryAggregateRoot {
        return new TraverseLibraryAggregateRoot(this.traversalRepository);
    }
}

export default new AggregateFactorySingleton(
    new TraversalRepository(),
    new ImageIndexRepository(APP_CACHE_DURATION),
); // Singleton instance through ES6 module caching