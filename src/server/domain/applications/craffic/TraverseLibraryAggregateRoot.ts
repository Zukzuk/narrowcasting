import TraversalRepository from './TraversalRepository.js';
import TraverseDirectoryService from '../services/TraverseDirectoryService.js';
import TraverseLibraryCommand from '../../commands/TraverseLibraryCommand.js';
import LibraryTraversalFailedEvent from '../../events/LibraryTraversalFailedEvent.js';
import LibraryTraversedEvent from '../../events/LibraryTraversedEvent.js';

/**
 * Aggregate root for traversing a library
 * 
 * @class TraverseLibraryAggregateRoot
 */
export default class TraverseLibraryAggregateRoot {
    
    private traverseDirectoryService: TraverseDirectoryService;

    // TODO: ! Finish implementing

    constructor(private traversalRepository: TraversalRepository) {
        this.traverseDirectoryService = new TraverseDirectoryService();
    }

    /**
     * Consumes a command to traverse a library
     * 
     * @param {TraverseLibraryCommand} command
     * @returns {(Promise<LibraryTraversedEvent | LibraryTraversalFailedEvent>)}
     */
    async consume(command: TraverseLibraryCommand): Promise<LibraryTraversedEvent | LibraryTraversalFailedEvent> {
        
        const { library } = command.payload;

        try {
            // Check if library indexes cache is filled
            let payload = this.traversalRepository.retrieve(library,);
            if (!payload) {
                payload = await this.traverseDirectoryService.toJson(library, { ignoreEmpty: true} );
                this.traversalRepository.save(library, payload);
            }

            // Return a business event
            return new LibraryTraversedEvent(payload);
        } catch (error: any) {
            // Return failure event
            const event = new LibraryTraversalFailedEvent(error.message, error.url);
            error.event = event;
            return event;
            // throw error;
        }
    }
}
