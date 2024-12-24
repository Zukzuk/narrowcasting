import { PLEX_API_KEY, PLEX_MACHINE_IDENTIFIER, PLEX_API, PLEX_ORIGIN } from '../../config.js';
import RetrieveImageCommand from '../shared/commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../../domain/shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../domain/shared/events/ImageRetrievalFailedEvent.js';
import MediaImageService from '../../domain/media/services/MediaImageService.js';
import ImageOptimizeService from '../../domain/shared/services/ImageOptimizeService.js';
import ImageSetRepository from '../../infrastructure/repositories/ImageIndexRepository.js';

export default class RetrieveMediaCoverAggregateRoot {

    private mediaImageService: MediaImageService;
    private imageOptimizeService: ImageOptimizeService;
    private timestamp: number = 0;
    private retries: number = -1;

    constructor(private imageSetRepository: ImageSetRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API, PLEX_API_KEY);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RetrieveImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { index, mediaType, interval } = command.payload;
        this.timestamp = this.timestamp || Date.now();

        try {
            // Get media
            const randomMedia = this.imageSetRepository.retrieveData(mediaType, index);
            const url = `${PLEX_ORIGIN}/web/index.html#!/server/${PLEX_MACHINE_IDENTIFIER}/details?key=/library/metadata/${randomMedia.ratingKey}`;
            
            // Fetch image
            const response = await this.mediaImageService.fetchImage(randomMedia.thumb, interval, this.timestamp, ++this.retries);
            
            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({image: optimizedImage, contentType, url }, mediaType);
        } catch (error: any) {
            // Retry on error
            if (error.retry) this.consume(command);
            
            // Return failure event
            const event = new ImageRetrievalFailedEvent(error.message, error.url);
            error.event = event;
            return event;
            // throw error;
        }
    }
}
