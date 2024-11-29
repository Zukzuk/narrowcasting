import { KOMGA_API, KOMGA_AUTH, KOMGA_ORIGIN } from '../../config.js';
import RandomImageCommand from '../shared/commands/RandomImageCommand.js';
import ImageRetrievedEvent from '../shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../shared/events/ImageRetrievalFailedEvent.js';
import ComicsImageService from '../../domain/comics/services/ComicsImageService.js';
import ImageOptimizeService from '../shared/services/ImageOptimizeService.js';
import ComicsImageSetRepository from '../../infrastructure/repositories/ComicsImageSetRepository.js';
import { TDomain } from '../shared/types/types.js';

export default class RandomComicImageAggregateRoot {
    private comicsImageService: ComicsImageService;
    private imageOptimizeService: ImageOptimizeService;
    private timestamp: number = 0;
    private retries: number = -1;
    private domain: TDomain = 'comics';

    constructor(private repository: ComicsImageSetRepository) {
        this.comicsImageService = new ComicsImageService(KOMGA_API, KOMGA_AUTH);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RandomImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { page, interval } = command.payload;
        const guardedInterval = isNaN(interval) ? 10000 : interval < 3000 ? 3000 : interval;
        this.timestamp = this.timestamp || Date.now();

        try {
            // Check if set is filled
            const hasSet = this.repository.retrieveTotal();
            if (!hasSet) {
                // Fill set with comics
                const response = await this.comicsImageService.fetchTotalBooks();
                this.repository.save(response);
            }
            // Get random comic
            const randomIndex = await this.repository.retrieveFromSet();
            const bookId = await this.comicsImageService.fetchBookId(randomIndex);
            const url = `${KOMGA_ORIGIN}/book/${bookId}`

            // Fetch image
            const response = await this.comicsImageService.fetchImage(bookId, page, guardedInterval, this.timestamp, ++this.retries);
            if (response === 'RETRY') await this.consume(command);

            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({ image: optimizedImage, contentType, url }, this.domain);
        } catch (error: any) {
            // Return failure event
            const event = new ImageRetrievalFailedEvent(error.message, error.url, this.domain);
            error.event = event;
            throw error;
        }
    }
}
