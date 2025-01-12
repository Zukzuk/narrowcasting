import { KOMGA_API, KOMGA_AUTH, KOMGA_ORIGIN } from '../../../config.js';
import RetrieveImageCommand from '../../shared/commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../../shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../shared/events/ImageRetrievalFailedEvent.js';
import ComicsImageService from './services/ComicsImageService.js';
import ImageOptimizeService from '../../shared/services/ImageOptimizeService.js';
import RetryImageRetrievalEvent from '../../shared/events/RetryImageRetrievalEvent.js';

/**
 * Aggregate root for retrieving comic images from Komga.
 * 
 * @class RetrieveComicImageAggregateRoot
 */
export default class RetrieveComicsImageAggregateRoot {

    private comicsImageService: ComicsImageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor() {
        this.comicsImageService = new ComicsImageService(KOMGA_API, KOMGA_AUTH);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    /**
     * Consume a retrieve image command.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent>}
     * @memberof RetrieveComicImageAggregateRoot
     */
    async consume(command: RetrieveImageCommand): Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {

        const { userId, index, mediaType, page, interval, startTime } = command.payload;

        try {
            // Get random comic
            const bookId = await this.comicsImageService.fetchBookId(index);
            const url = `${KOMGA_ORIGIN}/book/${bookId}`

            // Fetch image
            const response = await this.comicsImageService.fetchImage(bookId, page);

            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({ userId, mediaType, image: optimizedImage, contentType, url });
        } catch (error: any) {
            // Retry image retrieval if there is enough time left in the interval
            const elapsedTime = Date.now() - startTime;
            const remainingTime = interval - elapsedTime;
            if (remainingTime > 5000) {
                const payload = { userId, page, interval, startTime };
                const event = new RetryImageRetrievalEvent(payload);
                return event;
            }
            console.warn(`No retry attempted, not enough time remaining time in interval (${remainingTime}ms).`);

            // Return failure event
            const event = new ImageRetrievalFailedEvent(error.message, error.url, error.mediaType);
            error.event = event;
            return event;
            // throw error;
        }
    }
}
