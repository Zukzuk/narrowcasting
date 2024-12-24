import { KOMGA_API, KOMGA_AUTH, PLEX_API, PLEX_API_KEY } from '../../config.js';
import MediaImageService from '../../domain/media/services/MediaImageService.js';
import ComicsImageService from '../../domain/comics/services/ComicsImageService.js';
import SelectRandomImageCommand from './commands/SelectRandomImageCommand.js';
import RandomImageSelectedEvent from './events/RandomImageSelectedEvent.js';
import RandomImageSelectionFailedEvent from './events/RandomImageSelectionFailedEvent.js';
import ImageIndexRepository from '../../infrastructure/repositories/ImageIndexRepository.js';
import { mediaTypesKomga, mediaTypesPlex, TMediaType } from '../shared/types/index.js';

export default class SelectRandomImageAggregateRoot {

    private mediaImageService: MediaImageService;
    private comicsImageService: ComicsImageService;

    constructor(private imageIndexRepository: ImageIndexRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API, PLEX_API_KEY);
        this.comicsImageService = new ComicsImageService(KOMGA_API, KOMGA_AUTH);
    }

    async consume(command: SelectRandomImageCommand): Promise<RandomImageSelectedEvent | RandomImageSelectionFailedEvent> {

        const { page, interval, startTime } = command.payload;

        try {
            // Check if library indexes cache is filled
            let cache = this.imageIndexRepository.retrieve();
            const hasValidCache = this.imageIndexRepository.hasValidCache();

            if (!hasValidCache) {
                const invalidCaches = this.imageIndexRepository.getInvalidCacheHits();

                if (mediaTypesKomga.some(type => invalidCaches.includes(type))) {
                    // Fetch comics totals (no data, because needs to be crawled per page)
                    const response = await this.comicsImageService.fetchTotalBooks();
                    cache["comics"] = this.imageIndexRepository.save("comics", { total: response });
                }

                if (mediaTypesPlex.some(type => invalidCaches.includes(type))) {
                    // Fetch media totals and data (recieves full section contents data)
                    const sections = await this.mediaImageService.fetchSections();
                    sections.forEach(async (section) => {
                        // Fetch media for each section
                        const key = section.key;
                        const mediaType = section.title.toLowerCase().replace(/ /g, '-') as TMediaType;
                        // Fill set with mediaType
                        const response = await this.mediaImageService.fetchSectionMedia(mediaType, key);
                        cache[mediaType] = this.imageIndexRepository.save(mediaType, { data: response });
                    });
                }
            }

            // Calculate the total weight based on `remaining`
            const totalWeight = Object.entries(cache).reduce((sum, [, cache]) => sum + cache.remaining, 0);
            if (!totalWeight) throw new Error("No total items in the cache to select from.");

            // Build cumulative probability map
            const probabilityMap = Object.entries(cache).reduce(
                (acc, [mediaType, cacheItem], i, array) => {
                    const probability = cacheItem.remaining / totalWeight;
                    const threshold = (!i) ? probability : (i === array.length -1) ? 1 : (acc[i - 1].threshold + probability);
                    acc.push({ threshold, mediaType: mediaType as TMediaType });
                    return acc;
                },
                [] as { threshold: number; mediaType: TMediaType }[]
            );

            // Pick weighted random mediaType 
            const randomValue = Math.random();
            const mediaType = probabilityMap.find(({ threshold }) => randomValue <= threshold)?.mediaType;
            if (!mediaType) throw new Error("Failed to select a random media type (this should not happen).");
            const cacheItem = cache[mediaType];
            if (!cacheItem) throw new Error(`Media type "${mediaType}" not found in cache (this should not happen).`);
            console.log(`SelectRandomImageAggregateRoot: threshold ${randomValue} -> ${mediaType}`);

            // Pick random index from the random mediaType
            const index = this.imageIndexRepository.popUniqueIndex(mediaType);

            // Return a business event
            return new RandomImageSelectedEvent({ index, mediaType, page, interval, startTime });
        } catch (error: any) {
            // Return failure event
            const event = new RandomImageSelectionFailedEvent(error.message);
            error.event = event;
            return event;
            // throw error;
        }
    }
}
