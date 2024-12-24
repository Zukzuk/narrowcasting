import { PLEX_API_KEY, PLEX_MACHINE_IDENTIFIER, PLEX_API, PLEX_ORIGIN } from '../../config.js';
import RetrieveImageCommand from '../shared/commands/RetrieveImageCommand.js';
import RetryImageRetrievalEvent from '../shared/events/RetryImageRetrievalEvent.js';
import ImageRetrievedEvent from '../../domain/shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../domain/shared/events/ImageRetrievalFailedEvent.js';
import MediaImageService from '../../domain/media/services/MediaImageService.js';
import ImageOptimizeService from '../../domain/shared/services/ImageOptimizeService.js';
import ImageSetRepository from '../../infrastructure/repositories/ImageIndexRepository.js';

export default class RetrieveMediaCoverAggregateRoot {

    private mediaImageService: MediaImageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor(private imageSetRepository: ImageSetRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API, PLEX_API_KEY);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RetrieveImageCommand): Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {

        const { index, mediaType, interval, startTime } = command.payload;

        try {
            // Get media
            const randomMedia = this.imageSetRepository.retrieveData(mediaType, index);
            const url = `${PLEX_ORIGIN}/web/index.html#!/server/${PLEX_MACHINE_IDENTIFIER}/details?key=/library/metadata/${randomMedia.ratingKey}`;

            // Fetch image
            const response = await this.mediaImageService.fetchImage(randomMedia.thumb);

            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({ image: optimizedImage, contentType, url }, mediaType);
        } catch (error: any) {
            // Retry image retrieval if image format is not supported
            if (error.message.contains('Unsupported image format')) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = interval - elapsedTime;
                if (remainingTime > 5000) {
                    const payload = { page: 0, interval, startTime };
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
