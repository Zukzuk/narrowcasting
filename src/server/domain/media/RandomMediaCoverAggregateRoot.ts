import { PLEX_API_KEY, PLEX_MACHINE_IDENTIFIER, PLEX_API, PLEX_ORIGIN } from '../../config.js';
import RandomImageCommand from '../generic/commands/RandomImageCommand.js';
import ImageRetrievedEvent from '../generic/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../generic/events/ImageRetrievalFailedEvent.js';
import MediaImageService from '../../domain/media/services/MediaImageService.js';
import ImageOptimizeService from '../generic/services/ImageOptimizeService.js';
import MediaImageSetRepository from '../../infrastructure/repositories/MediaImageSetRepository.js';
import { TDomain } from '../generic/types/types.js';

export default class RandomMediaCoverAggregateRoot {
    private mediaImageService: MediaImageService;
    private imageOptimizeService: ImageOptimizeService;
    private timestamp: number = 0;
    private retries: number = -1;

    constructor(private mediaImageSetRepository: MediaImageSetRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API_KEY, PLEX_API);
        this.imageOptimizeService = new ImageOptimizeService();
    }

    async consume(command: RandomImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { interval } = command.payload;
        const guardedInterval = isNaN(interval) ? 10000 : interval < 3000 ? 3000 : interval;
        this.timestamp = this.timestamp || Date.now();

        try {
            const sections = await this.mediaImageService.fetchSections();
            // const movieKey = sections.find((d: any) => d.title === 'Movies').key;
            const index = Math.floor((Math.random() * sections.length));
            const key = sections[index].key;
            const domain = sections[index].title.toLowerCase().replace(/ /g, '-') as TDomain;
            const hasSet = this.mediaImageSetRepository.retrieveTotal(domain);
            if (!hasSet) {
                const response = await this.mediaImageService.fetchSectionMedia(domain, key);
                this.mediaImageSetRepository.save(domain, response);
            }
            const randomIndex = this.mediaImageSetRepository.retrieveFromSet(domain);
            const randomMedia = this.mediaImageSetRepository.retrieveData(domain, randomIndex);
            const url = `${PLEX_ORIGIN}/web/index.html#!/server/${PLEX_MACHINE_IDENTIFIER}/details?key=/library/metadata/${randomMedia.ratingKey}`;
            const response = await this.mediaImageService.fetchImage(randomMedia.thumb, guardedInterval, this.timestamp, ++this.retries);
            // if (response === 'RETRY') await this.consume(command);
            const { optimizedImage, contentType } = await this.imageOptimizeService.webp(response, 90);

            // Return a business event
            return new ImageRetrievedEvent({
                payload: {
                    image: optimizedImage,
                    contentType,
                    url,
                },
                domain,
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            // Return failure event
            const event = new ImageRetrievalFailedEvent({
                url: error.url,
                error: error.message,
                domain: 'movies',
                timestamp: new Date().toISOString(),
            });
            error.event = event;
            throw error;
        }
    }
}
