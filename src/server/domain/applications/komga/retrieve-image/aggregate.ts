import { KOMGA_ORIGIN } from '../../../../config.js';
import RetrieveImageCommand from '../../../commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../../../events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../../events/ImageRetrievalFailedEvent.js';
import RetryImageRetrievalEvent from '../../../events/RetryImageRetrievalEvent.js';
import RetrievePageService from './retrieve-page.service.js';
import ImageOptimizeService from '../../services/ImageOptimizeService.js';
import { UrlError } from '../../../../utils.js';

export enum EKomgaMediaType {
    Comics = "comics",
}

export type TKomgaImageData = {
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
    private command: RetrieveImageCommand;
    private data: TKomgaImageData | null = null;
    private uncommittedData: TKomgaImageData | null = null;
    private raisedEvents: Array<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> = [];

    private retrievePageService: RetrievePageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor(command: RetrieveImageCommand) {
        this.command = command;
        this.retrievePageService = new RetrievePageService();
        this.imageOptimizeService = new ImageOptimizeService();
    }

    set(data: TKomgaImageData | null): void {
        this.data = data;
    }

    get(): TKomgaImageData | null {
        return this.data;
    }

    hasUncommittedData(): boolean {
        return this.uncommittedData !== null && !!Object.keys(this.uncommittedData).length;
    }

    getUncommittedData(): TKomgaImageData | null {
        return this.uncommittedData;
    }

    getRaisedEvents(): Array<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {
        return this.raisedEvents;
    }


    async execute(): Promise<void> {
        const { userId, index, page, interval, startTime } = this.command.payload;

        try {
            // Get random comic
            const bookId = await this.retrievePageService.fetchBookId(index);
            // Create URI
            const url = `${KOMGA_ORIGIN}/book/${bookId}`
            // Fetch image
            const image = await this.retrievePageService.fetchImage(bookId, page);
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
            console.error(`Error retrieving image: ${error.message}`);
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
                const { mediaType } = this.command.payload;
                const event = new ImageRetrievalFailedEvent(message, mediaType, url);
                this.raisedEvents.push(event);
            }
        }
    }

    async update(payload?: TKomgaImageData | null, error?: Error): Promise<void> {
        const { userId, mediaType } = this.command.payload;
        if (error) {
            const { message } = error;
            const event = new ImageRetrievalFailedEvent(message, mediaType);
            this.raisedEvents.push(event);
        } else if (payload) {
            const { image, contentType, url } = payload;
            const event = new ImageRetrievedEvent({ userId, mediaType, image, contentType, url });
            this.raisedEvents.push(event);
        }

        this.data = payload || null;
        this.uncommittedData = null;
    }
}
