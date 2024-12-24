import { KOMGA_API, KOMGA_AUTH, KOMGA_ORIGIN } from '../../config.js';
import RetrieveImageCommand from '../shared/commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../shared/events/ImageRetrievalFailedEvent.js';
import ComicsImageService from './services/ComicsImageService.js';
import ImageOptimizeService from '../shared/services/ImageOptimizeService.js';
import ImageSetRepository from '../../infrastructure/repositories/ImageIndexRepository.js';

export default class RetrieveComicImageAggregateRoot {
    
    private comicsImageService: ComicsImageService;
    private imageOptimizeService: ImageOptimizeService;
    private timestamp: number = 0;
    private retries: number = -1;

    constructor(private imageSetRepository: ImageSetRepository) {
        this.comicsImageService = new ComicsImageService(KOMGA_API, KOMGA_AUTH);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RetrieveImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { index, mediaType, page, interval } = command.payload;
        this.timestamp = this.timestamp || Date.now();

        try {
            // Get random comic
            const bookId = await this.comicsImageService.fetchBookId(index);
            const url = `${KOMGA_ORIGIN}/book/${bookId}`

            // Fetch image
            const response = await this.comicsImageService.fetchImage(bookId, page, interval, this.timestamp, ++this.retries);

            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({ image: optimizedImage, contentType, url }, mediaType);
        } catch (error: any) {            
            // Return failure event
            const event = new ImageRetrievalFailedEvent(error.message, error.url);
            error.event = event;
            return event;
            // throw error;
        }
    }
}
