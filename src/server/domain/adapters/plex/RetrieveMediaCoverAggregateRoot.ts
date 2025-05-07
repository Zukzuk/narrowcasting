import { PLEX_API_KEY, PLEX_MACHINE_IDENTIFIER, PLEX_API, PLEX_ORIGIN } from '../../../config.js';
import RetrieveImageCommand from '../../commands/RetrieveImageCommand.js';
import RetryImageRetrievalEvent from '../../events/RetryImageRetrievalEvent.js';
import ImageRetrievedEvent from '../../events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../events/ImageRetrievalFailedEvent.js';
import MediaImageService, { IPlexMediaContainer } from './services/MediaImageService.js';
import ImageOptimizeService from '../../services/ImageOptimizeService.js';
import ImageIndexRepository from '../../repositories/ImageIndexRepository.js';

/**
 * Aggregate root to retrieve a media cover image from a given index
 * 
 * @class RetrieveMediaCoverAggregateRoot
 */
export default class RetrieveMediaCoverAggregateRoot {

    private mediaImageService: MediaImageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor(private imageIndexRepository: ImageIndexRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API, PLEX_API_KEY);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    /**
     * Consume a command to retrieve a media cover image
     * 
     * @param {RetrieveImageCommand} command
     * @returns {(Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent>)}
     * @memberof RetrieveMediaCoverAggregateRoot
     */
    async consume(command: RetrieveImageCommand): Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {

        const { userId, index, mediaType, interval, startTime } = command.payload;

        try {
            // Get media
            const data = this.imageIndexRepository.retrieveData(userId, mediaType, index) as IPlexMediaContainer;
            const url = `${PLEX_ORIGIN}/web/index.html#!/server/${PLEX_MACHINE_IDENTIFIER}/details?key=/library/metadata/${data.ratingKey}`;

            // Fetch image
            const response = await this.mediaImageService.fetchImage(data.thumb);

            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({ userId, mediaType, image: optimizedImage, contentType, url }, mediaType);
        } catch (error: any) {
            // Retry image retrieval if there is enough time left in the interval
            const elapsedTime = Date.now() - startTime;
            const remainingTime = interval - elapsedTime;
            if (remainingTime > 5000) {
                const payload = { userId, page: 0, interval, startTime };
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
