import { KOMGA_ORIGIN } from '../../../../config.js';
import RetrieveImageCommand from '../../../commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../../../events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../../events/ImageRetrievalFailedEvent.js';
import RetryImageRetrievalEvent from '../../../events/RetryImageRetrievalEvent.js';
import RetrieveImageService from './retrieve-image.service.js';
import ImageOptimizeService from '../../services/ImageOptimizeService.js';
import { TMediaType } from '../../../types/index.js';
import { UrlError } from '../../../../utils.js';

export type TImageData = {
    image: Buffer;
    contentType: string;
    url: string;
    index: number;
    page: number;
}

/**
 * Aggregate root for retrieving comic images from Komga.
 * 
 * @class RetrieveKomgaImageAggregateRoot
 */
export default class RetrieveKomgaImageAggregateRoot {
    private mediaType: TMediaType = 'comics';
    private data: TImageData | null = null;
    private uncommittedData: TImageData | null = null;
    private raisedEvents: Array<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> = [];

    private retrieveImageService: RetrieveImageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor() {
        this.retrieveImageService = new RetrieveImageService();
        this.imageOptimizeService = new ImageOptimizeService();
    }

    set(data: TImageData | null): void {
        this.data = data;
    }

    get(): TImageData | null {
        return this.data;
    }

    hasUncommittedData(): boolean {
        return this.uncommittedData !== null && !!Object.keys(this.uncommittedData).length;
    }

    getUncommittedData(): TImageData | null {
        return this.uncommittedData;
    }

    getRaisedEvents(): Array<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {
        return this.raisedEvents;
    }


    async execute(command: RetrieveImageCommand): Promise<void> {
        const { userId, index, page, interval, startTime } = command.payload;

        try {
            // Get random comic
            const bookId = await this.retrieveImageService.fetchBookId(index);
            // Create URI
            const url = `${KOMGA_ORIGIN}/book/${bookId}`
            // Fetch image
            const image = await this.retrieveImageService.fetchImage(bookId, page);
            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(image as Buffer, 90);
            // Set uncommitted data
            this.uncommittedData = {
                image: optimizedImage,
                contentType,
                url,
                index,
                page,
            }
        } catch (error: any) {
            this.uncommittedData = null;

            // Retry image retrieval if there is enough time left in the interval
            const elapsedTime = Date.now() - startTime;
            const remainingTime = interval - elapsedTime;
            if (remainingTime > 5000) {
                const payload = { userId, page, interval, startTime };
                const event = new RetryImageRetrievalEvent(payload);
                this.raisedEvents.push(event);
            } else {
                console.warn(`No retry attempted, not enough time remaining in interval (${remainingTime}ms).`);
                error = error as UrlError;
                const { message, url } = error;

                const event = new ImageRetrievalFailedEvent(message, this.mediaType, url);
                this.raisedEvents.push(event);
            }
        }
    }

    async update(command: RetrieveImageCommand, payload?: TImageData | null, error?: Error): Promise<void> {
        if (error) {
            const { message } = error;
            const event = new ImageRetrievalFailedEvent(message, this.mediaType);
            this.raisedEvents.push(event);
        } else if (payload) {
            const { userId } = command.payload;
            const { image, contentType, url } = payload;
            const event = new ImageRetrievedEvent({ userId, mediaType: this.mediaType, image, contentType, url });
            this.raisedEvents.push(event);
        }

        this.data = payload || null;
        this.uncommittedData = null;
    }
}
