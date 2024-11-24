import TotalComicsRepository from '../../infrastructure/repositories/TotalComicsRepository.js';
import SessionRepository from '../../infrastructure/repositories/SessionRepository.js';
import { KOMGA_API, KOMGA_AUTH } from '../../config.js';
import ImageOptimizationService from '../../domain/comics/services/ImageOptimizationService.js';
import RandomImageService from '../../domain/comics/services/RandomImageService.js';
import FindRandomImageCommand from '../../domain/comics/commands/RandomImageCommand.js';
import ImageRetrievedEvent from '../../domain/comics/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../domain/comics/events/ImageRetrievalFailedEvent.js';

export default class RandomComicImageAggregateRoot {
    private randomImageService: RandomImageService;
    private imageOptimizationService: ImageOptimizationService;

    constructor(
        private totalComicsRepository: TotalComicsRepository<number>,
        private sessionRepository: SessionRepository
    ) {
        this.randomImageService = new RandomImageService(KOMGA_API, KOMGA_AUTH);
        this.imageOptimizationService = new ImageOptimizationService();
    }

    async consume(command: FindRandomImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { page, interval } = command.payload;
    
        try {
            // Get total books from cache or API
            let totalItems = this.totalComicsRepository.retrieve();
            if (!totalItems) {
                const data = await this.randomImageService.getTotalItems();
                totalItems = this.totalComicsRepository.save(data);
            }
    
            // Retrieve a random index from session
            const remainingSet = this.sessionRepository.retrieve(totalItems);
            const randomIndex = Math.floor(Math.random() * remainingSet.length);
            remainingSet.splice(randomIndex, 1); // Remove used index
            this.sessionRepository.save(remainingSet);
    
            // Fetch book ID and raw image
            const bookId = await this.randomImageService.getBookId(randomIndex);
            const { image, contentType } = await this.randomImageService.getImage(bookId, page);
    
            // Do image optimization
            const { optimizedImage, optimizedContentType } =
                await this.imageOptimizationService.optimizeImage(image, contentType);
    
            // Return a business event
            return new ImageRetrievedEvent({
                payload: { bookId, image: optimizedImage, contentType: optimizedContentType },
                totalItems,
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            // Return failure event
            const event = new ImageRetrievalFailedEvent({
                url: error.url,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
            error.event = event;
            throw error;
        }
    }
}
