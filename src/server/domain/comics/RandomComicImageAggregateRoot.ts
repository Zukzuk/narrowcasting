import axios from 'axios';
import { KOMGA_API, KOMGA_AUTH, APP_CACHE_DURATION } from '../../config.js';
import RandomImageService from '../../domain/comics/services/RandomImageService.js';
import RandomImageCommand from '../../domain/comics/commands/RandomImageCommand.js';
import ImageRetrievedEvent from '../../domain/comics/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../../domain/comics/events/ImageRetrievalFailedEvent.js';

export default class RandomComicImageAggregateRoot {
    private randomImageService: RandomImageService;

    constructor() {
        this.randomImageService = new RandomImageService(KOMGA_API, KOMGA_AUTH, APP_CACHE_DURATION);
    }

    async consume(command: RandomImageCommand): Promise<ImageRetrievedEvent | ImageRetrievalFailedEvent> {
        const { page, interval, session } = command.payload;

        try {
            const guardedInterval = isNaN(interval) ? 10000 : interval < 3000 ? 3000 : interval;
            const payload = await this.randomImageService.randomImage(page, guardedInterval, session);
            // Return a business event
            return new ImageRetrievedEvent({
                payload,
                domain: 'comics',
                timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
            // Return failure event
            const event = new ImageRetrievalFailedEvent({
                url: error.url,
                error: error.message,
                timestamp: new Date().toISOString(),
            });
            error.event = event;
            throw error;
        }
    }
}
