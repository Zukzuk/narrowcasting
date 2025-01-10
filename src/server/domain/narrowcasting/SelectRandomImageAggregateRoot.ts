import { log, shuffleArray } from '../../utils.js';
import { KOMGA_API, KOMGA_AUTH, PLAYNITE_BACKUP_ORIGIN, PLEX_API, PLEX_API_KEY } from '../../config.js';
import { mediaTypesKomga, mediaTypesPlex, mediaTypesPlaynite, TMediaType } from '../shared/types/index.js';
import MediaImageService from '../adapters/plex/services/MediaImageService.js';
import ComicsImageService from '../adapters/komga/services/ComicsImageService.js';
import GamesImageService from '../adapters/playnite/services/GamesImageService.js';
import SelectRandomImageCommand from '../shared/commands/SelectRandomImageCommand.js';
import RandomImageSelectedEvent from '../shared/events/RandomImageSelectedEvent.js';
import RandomImageSelectionFailedEvent from '../shared/events/RandomImageSelectionFailedEvent.js';
import ImageIndexRepository, { IWeightedCache } from '../../infrastructure/repositories/ImageIndexRepository.js';

/**
 * Aggregate root for selecting a random image from a media library.
 * 
 * This aggregate root is responsible for selecting a random image from a media library.
 * @exports
 * @class SelectRandomImageAggregateRoot
 */
export default class SelectRandomImageAggregateRoot {

    private mediaImageService: MediaImageService;
    private comicsImageService: ComicsImageService;
    private gamesImageService: GamesImageService;

    constructor(private imageIndexRepository: ImageIndexRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API, PLEX_API_KEY);
        this.comicsImageService = new ComicsImageService(KOMGA_API, KOMGA_AUTH);
        this.gamesImageService = new GamesImageService(PLAYNITE_BACKUP_ORIGIN);
    }

    /**
     * Consumes a command to select a random image from a media library.
     * 
     * @param command The command to consume.
     * @returns A business event.
     * @memberof SelectRandomImageAggregateRoot
     */
    async consume(command: SelectRandomImageCommand): Promise<RandomImageSelectedEvent | RandomImageSelectionFailedEvent> {

        const { userId, page, interval, startTime } = command.payload;

        try {
            // Check if library index caches are filled
            const hasValidCaches = this.imageIndexRepository.hasValidCaches(userId);

            // If not, fetch data for each media type
            if (!hasValidCaches) {
                await this.#populateCaches(userId);
            }

            // Check if weighted cache is filled
            const hasValidWeightedCache = this.imageIndexRepository.hasValidWeightedCache(userId);

            // If not, create a weighted cache
            if (!hasValidWeightedCache) {
                this.#createWeightedCache(userId);
            }

            // Retrieve the weighted index using the repository method
            const { mediaType, index } = this.imageIndexRepository.getWeightedIndex(userId);

            log(userId, 'SelectRandomImageAggregateRoot', 'weighted', 'select', `Selected '${mediaType}' with index '${index}'`);

            // Return a business event
            return new RandomImageSelectedEvent({ userId, index, mediaType, page, interval, startTime });
        } catch (error: any) {
            // Return failure event
            const event = new RandomImageSelectionFailedEvent(error.message, error.url);
            error.event = event;
            return event;
        }
    }

    /**
     * Populates the caches for different media types.
     * @param userId The ID of the user.
     */
    async #populateCaches(userId: string): Promise<void> {
        const invalidCaches = this.imageIndexRepository.getInvalidCacheHits(userId);

        // Fetch and save data for Komga (Comics)
        if (mediaTypesKomga.some(type => invalidCaches.includes(type))) {
            const total = await this.comicsImageService.fetchTotalBooks();
            this.imageIndexRepository.save(userId, 'comics', { total });
        }

        // Fetch and save data for Playnite (Games)
        if (mediaTypesPlaynite.some(type => invalidCaches.includes(type))) {
            const data = await this.gamesImageService.fetchGamesData();
            this.imageIndexRepository.save(userId, 'games', { data });
        }

        // Fetch and save data for Plex (Media)
        if (mediaTypesPlex.some(type => invalidCaches.includes(type))) {
            const sections = await this.mediaImageService.fetchSections();
            await Promise.all(sections.map(async section => {
                const key = section.key;
                const mediaType = section.title.toLowerCase().replace(/ /g, '-') as TMediaType;
                const data = await this.mediaImageService.fetchMediaData(mediaType, key);
                this.imageIndexRepository.save(userId, mediaType, { data });
            }));
        }
    }

    /**
     * Creates a weighted cache to ensure balanced and random selection across media types.
     * @param userId The ID of the user.
     */
    #createWeightedCache(userId: string): void {
        const caches = this.imageIndexRepository.retrieve(userId);
        const cacheTotals = Object.values(caches).map(cache => cache.total);

        if (cacheTotals.length === 0) {
            throw new Error("No media types available in cache.");
        }

        const numberOfSets = Math.min(...cacheTotals);
        if (numberOfSets === 0) {
            throw new Error("One of the media types has no available indexes.");
        }

        // Initialize an array of sets
        const weightedSets: IWeightedCache[][] = Array.from({ length: numberOfSets }, () => []);

        // Distribute shuffled indexes into sets in a round-robin fashion
        Object.entries(caches).forEach(([mediaType, cache]) => {
            const shuffledIndexes = shuffleArray([...cache.uniqueIndexes]);
            shuffledIndexes.forEach((index, i) => {
                const setIndex = i % numberOfSets;
                weightedSets[setIndex].push({ mediaType: mediaType as TMediaType, index });
            });
        });

        // Shuffle each set to maintain randomness across media types
        weightedSets.forEach(set => shuffleArray(set));

        // Flatten the sets into a single weighted list
        const weightedCache: IWeightedCache[] = weightedSets.flat();

        // Save the weighted list to cache
        this.imageIndexRepository.saveWeighted(userId, weightedCache);
    }
}