import { KOMGA_API, KOMGA_AUTH, KOMGA_ORIGIN } from '../../config.js';
import RandomImageCommand from '../../domain/comics/commands/RandomImageCommand.js';
import ImageRetrievedEvent from '../../domain/comics/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../domain/comics/events/ImageRetrievalFailedEvent.js';
import ImageService from '../../domain/comics/services/ImageService.js';
import ImageOptimizeService from '../../domain/optimization/ImageOptimizeService.js';
import ImageRepository from '../../infrastructure/repositories/ImageRepository.js';

export default class RandomComicImageAggregateRoot {
    private imageService: ImageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor(private imageRepository: ImageRepository) {
        this.imageService = new ImageService(KOMGA_API, KOMGA_AUTH);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RandomImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { page, interval } = command.payload;
        const guardedInterval = isNaN(interval) ? 10000 : interval < 3000 ? 3000 : interval;

        try {
            const set = this.imageRepository.retrieve();
            if (!set.length) {
                const response = await this.imageService.fetchTotalBooks();
                this.imageRepository.save(response);
            }
            const randomIndex = await this.imageRepository.retrieveFromSet();
            const bookId = await this.imageService.fetchBookId(randomIndex);
            const bookUrl = `${KOMGA_ORIGIN}/book/${bookId}`
            const image = await this.imageService.fetchImage(bookId, page, guardedInterval, Date.now(), 0);
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(image as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({
                payload: {
                    image: optimizedImage,
                    contentType,
                    bookUrl,
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
