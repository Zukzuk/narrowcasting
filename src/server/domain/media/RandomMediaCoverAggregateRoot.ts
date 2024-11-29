import { PLEX_API_KEY, PLEX_MACHINE_IDENTIFIER, PLEX_API, PLEX_ORIGIN } from '../../config.js';
import RandomImageCommand from '../shared/commands/RandomImageCommand.js';
import ImageRetrievedEvent from '../shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../shared/events/ImageRetrievalFailedEvent.js';
import MediaImageService from '../../domain/media/services/MediaImageService.js';
import ImageOptimizeService from '../shared/services/ImageOptimizeService.js';
import MediaImageSetRepository from '../../infrastructure/repositories/MediaImageSetRepository.js';
import { TDomain } from '../shared/types/types.js';

export default class RandomMediaCoverAggregateRoot {
    private mediaImageService: MediaImageService;
    private imageOptimizeService: ImageOptimizeService;
    private timestamp: number = 0;
    private retries: number = -1;
    private domain: TDomain = 'media';

    constructor(private mediaImageSetRepository: MediaImageSetRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API_KEY, PLEX_API);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RandomImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { interval } = command.payload;
        const guardedInterval = isNaN(interval) ? 10000 : interval < 3000 ? 3000 : interval;
        this.timestamp = this.timestamp || Date.now();

        try {
            // Fetch all media sections
            const sections = await this.mediaImageService.fetchSections();
            
            // Randomly select a section
            const index = Math.floor((Math.random() * sections.length));
            const key = sections[index].key;
            this.domain = sections[index].title.toLowerCase().replace(/ /g, '-') as TDomain;
            
            // Check if set is filled
            const hasSet = this.mediaImageSetRepository.retrieveTotal(this.domain);
            if (!hasSet) {
                // Fill set with media from domain
                const response = await this.mediaImageService.fetchSectionMedia(this.domain, key);
                this.mediaImageSetRepository.save(this.domain, response);
            }
            
            // Get random media
            const randomIndex = this.mediaImageSetRepository.retrieveFromSet(this.domain);
            const randomMedia = this.mediaImageSetRepository.retrieveData(this.domain, randomIndex);
            const url = `${PLEX_ORIGIN}/web/index.html#!/server/${PLEX_MACHINE_IDENTIFIER}/details?key=/library/metadata/${randomMedia.ratingKey}`;
            
            // Fetch image
            const response = await this.mediaImageService.fetchImage(randomMedia.thumb, guardedInterval, this.timestamp, ++this.retries);
            if (response === 'RETRY') await this.consume(command);
            
            // Optimize image
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response as Buffer, 90);

            // Return a business event
            return new ImageRetrievedEvent({image: optimizedImage, contentType, url }, this.domain);
        } catch (error: any) {
            // Return failure event
            const event = new ImageRetrievalFailedEvent(error.message, error.url, this.domain);
            error.event = event;
            throw error;
        }
    }
}
