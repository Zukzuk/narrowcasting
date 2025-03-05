import { PLAYNITE_BACKUP_IMAGE_FOLDER, PLAYNITE_BACKUP_ORIGIN } from '../../../config.js';
import RetrieveImageCommand from '../../core/commands/RetrieveImageCommand.js';
import ImageRetrievedEvent from '../../core/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../core/events/ImageRetrievalFailedEvent.js';
import GamesImageService, { IPlayniteGamesContainer } from './services/GamesImageService.js';
import ImageOptimizeService from '../../shared/services/ImageOptimizeService.js';
import RetryImageRetrievalEvent from '../../core/events/RetryImageRetrievalEvent.js';
import ImageIndexRepository from '../../../infrastructure/repositories/ImageIndexRepository.js';

/**
 * Aggregate root to retrieve a comic image from a given index
 * 
 * @class RetrieveComicImageAggregateRoot
 */
export default class RetrieveComicImageAggregateRoot {

    private gamesImageService: GamesImageService;
    private imageOptimizeService: ImageOptimizeService;

    constructor(private imageIndexRepository: ImageIndexRepository) {
        this.gamesImageService = new GamesImageService(PLAYNITE_BACKUP_ORIGIN, PLAYNITE_BACKUP_IMAGE_FOLDER);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    /**
     * Consume a command to retrieve a comic image
     * 
     * @param {RetrieveImageCommand} command
     * @returns {(Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent>)}
     * @memberof RetrieveComicImageAggregateRoot
     */
    async consume(command: RetrieveImageCommand): Promise<ImageRetrievedEvent | RetryImageRetrievalEvent | ImageRetrievalFailedEvent> {

        const { userId, index, mediaType, interval, startTime } = command.payload;

        try {
            // Get media
            const data = this.imageIndexRepository.retrieveData(userId, mediaType, index) as IPlayniteGamesContainer;

            // Fetch image
            const response = await this.gamesImageService.fetchImage(data.folderPath);

            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({ userId, mediaType, image: optimizedImage, contentType, url: data.folderPath });
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
