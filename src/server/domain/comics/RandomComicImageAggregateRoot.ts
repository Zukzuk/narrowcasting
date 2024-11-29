import { KOMGA_API, KOMGA_AUTH, KOMGA_ORIGIN } from '../../config.js';
import RandomImageCommand from '../../domain/generic/commands/RandomImageCommand.js';
import ImageRetrievedEvent from '../../domain/generic/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../domain/generic/events/ImageRetrievalFailedEvent.js';
import ComicsImageService from '../../domain/comics/services/ComicsImageService.js';
import ImageOptimizeService from '../../domain/generic/services/ImageOptimizeService.js';
import ComicsImageSetRepository from '../../infrastructure/repositories/ComicsImageSetRepository.js';

export default class RandomComicImageAggregateRoot {
    private comicsImageService: ComicsImageService;
    private imageOptimizeService: ImageOptimizeService;
    private timestamp: number = 0;
    private retries: number = -1;

    constructor(private comicsImageSetRepository: ComicsImageSetRepository) {
        this.comicsImageService = new ComicsImageService(KOMGA_API, KOMGA_AUTH);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RandomImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { page, interval } = command.payload;
        const guardedInterval = isNaN(interval) ? 10000 : interval < 3000 ? 3000 : interval;
        this.timestamp = this.timestamp || Date.now();

        try {
            const hasSet = this.comicsImageSetRepository.retrieveTotal();
            if (!hasSet) {
                const response = await this.comicsImageService.fetchTotalBooks();
                this.comicsImageSetRepository.save(response);
            }
            const randomIndex = await this.comicsImageSetRepository.retrieveFromSet();
            const bookId = await this.comicsImageService.fetchBookId(randomIndex);
            const url = `${KOMGA_ORIGIN}/book/${bookId}`
            const response = await this.comicsImageService.fetchImage(bookId, page, guardedInterval, this.timestamp, ++this.retries);
            if (response === 'RETRY') await this.consume(command);
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({
                payload: {
                    image: optimizedImage,
                    contentType,
                    url,
                },
                domain: 'comics',
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            // Return failure event
            const event = new ImageRetrievalFailedEvent({
                url: error.url,
                error: error.message,
                domain: 'comics',
                timestamp: new Date().toISOString(),
            });
            error.event = event;
            throw error;
        }
    }
}
