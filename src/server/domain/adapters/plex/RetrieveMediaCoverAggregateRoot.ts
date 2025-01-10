import { PLEX_API_KEY, PLEX_MACHINE_IDENTIFIER, PLEX_API, PLEX_ORIGIN } from '../../../config.js';
import RetrieveImageCommand from '../../shared/commands/RetrieveImageCommand.js';
import RetryImageRetrievalEvent from '../../shared/events/RetryImageRetrievalEvent.js';
import ImageRetrievedEvent from '../../../domain/shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../../domain/shared/events/ImageRetrievalFailedEvent.js';
import MediaImageService, { IPlexMediaContainer } from './services/MediaImageService.js';
import ImageOptimizeService from '../../../domain/shared/services/ImageOptimizeService.js';
import ImageIndexRepository from '../../../infrastructure/repositories/ImageIndexRepository.js';

/**
 * Aggregate root to retrieve a media cover image from a given index
 * 
 * @export
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
            // Retry image retrieval if image format is not supported
            if (error.message.contains('Unsupported image format')) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = interval - elapsedTime;
                if (remainingTime > 5000) {
                    const payload = { userId, page: 0, interval, startTime };
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