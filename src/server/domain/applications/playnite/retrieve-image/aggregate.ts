import RetrieveImageCommand from '../../../commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../../../events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../../events/ImageRetrievalFailedEvent.js';
import RetryImageRetrievalEvent from '../../../events/RetryImageRetrievalEvent.js';
import RetrieveCoverService, { IPlayniteGamesContainer } from './retrieve-cover.service.js';
import ImageOptimizeService from '../../services/ImageOptimizeService.js';
import { UrlError } from '../../../../utils.js';

export enum EPlayniteMediaType {
    Games = "games",
}

export type TPlayniteImageData = {
    image: Buffer;
    contentType: string;
    url: string;
    index: number;
}

/**
 * Aggregate root for retrieving comic images from Playnite.
 * 
 * @class RetrievePlayniteImageAggregateRoot
 */
export default class RetrievePlayniteImageAggregateRoot {
    private command: RetrieveImageCommand;
    private data: TPlayniteImageData | null = null;
    private uncommittedData: TPlayniteImageData | null = null;
    private raisedEvents: Array<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> = [];

    private retrieveCoverService: RetrieveCoverService;
    private imageOptimizeService: ImageOptimizeService;

    constructor(command: RetrieveImageCommand) {
        this.command = command;
        this.retrieveCoverService = new RetrieveCoverService();
        this.imageOptimizeService = new ImageOptimizeService();
    }

    set(data: TPlayniteImageData | null): void {
        this.data = data;
    }

    get(): TPlayniteImageData | null {
        return this.data;
    }

    hasUncommittedData(): boolean {
        return this.uncommittedData !== null && !!Object.keys(this.uncommittedData).length;
    }

    getUncommittedData(): TPlayniteImageData | null {
        return this.uncommittedData;
    }

    getRaisedEvents(): Array<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {
        return this.raisedEvents;
    }

    async execute(): Promise<void> {
        const { userId, mediaType, index, page, interval, startTime } = this.command.payload;
        const { folderPath } = this.command.metaData as IPlayniteGamesContainer;
        console.log(`Retrieving image for user ${userId} from Playnite: ${folderPath}`);

        try {
            // Create URI
            const url = folderPath;
            // Fetch image
            const image = await this.retrieveCoverService.fetchImage(folderPath);
            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(image as Buffer, 90);
            // Set uncommitted data
            this.uncommittedData = {
                image: optimizedImage,
                contentType,
                url,
                index,
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

                const event = new ImageRetrievalFailedEvent(message, mediaType, url);
                this.raisedEvents.push(event);
            }
        }
    }

    async update(payload?: TPlayniteImageData | null, error?: Error): Promise<void> {
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
