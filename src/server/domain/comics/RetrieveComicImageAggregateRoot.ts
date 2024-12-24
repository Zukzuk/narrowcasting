import { KOMGA_API, KOMGA_AUTH, KOMGA_ORIGIN } from '../../config.js';
import RetrieveImageCommand from '../shared/commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../shared/events/ImageRetrievalFailedEvent.js';
import ComicsImageService from './services/ComicsImageService.js';
import ImageOptimizeService from '../shared/services/ImageOptimizeService.js';
import RetryImageRetrievalEvent from '../shared/events/RetryImageRetrievalEvent.js';

export default class RetrieveComicImageAggregateRoot {
    
    private comicsImageService: ComicsImageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor() {
        this.comicsImageService = new ComicsImageService(KOMGA_API, KOMGA_AUTH);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RetrieveImageCommand): Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {
        
        const { index, mediaType, page, interval, startTime } = command.payload;

        try {
            // Get random comic
            const bookId = await this.comicsImageService.fetchBookId(index);
            const url = `${KOMGA_ORIGIN}/book/${bookId}`

            // Fetch image
            const response = await this.comicsImageService.fetchImage(bookId, page);

            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({ image: optimizedImage, contentType, url }, mediaType);
        } catch (error: any) {     
            // Retry image retrieval if image format is not supported
            if (error.message.contains('Unsupported image format')) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = interval - elapsedTime;
                if (remainingTime > 5000) {
                    const payload = { page, interval, startTime };
                    const event = new RetryImageRetrievalEvent(payload);
                    return event;
                }
                console.log(`No retry attempt because remaining time in interval (${remainingTime}ms) is too short...`);
            }
                   
            // Return failure event
            const event = new ImageRetrievalFailedEvent(error.message, error.url, error.mediaType);
            error.event = event;
            return event;
            // throw error;
        }
    }
}
