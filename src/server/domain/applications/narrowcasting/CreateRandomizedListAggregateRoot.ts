import { log, shuffleArray } from '../../../utils.js';
import { PLAYNITE_BACKUP_IMAGE_FOLDER, PLAYNITE_BACKUP_ORIGIN, PLEX_API, PLEX_API_KEY } from '../../../config.js';
import { mediaTypesKomga, mediaTypesPlex, mediaTypesPlaynite, TMediaType } from '../../types/index.js';
import MediaImageService from '../plex/services/MediaImageService.js';
import ComicsImageService from '../komga/retrieve-image/retrieve-image.service.js';
import GamesImageService from '../playnite/services/GamesImageService.js';
import CreateRandomizedListCommand from '../../commands/CreateRandomizedListCommand.js';
import RandomizedListCreatedEvent from '../../events/RandomizedListCreatedEvent.js';
import RandomizedListCreationFailedEvent from '../../events/RandomizedListCreationFailedEvent.js';
import ImageIndexRepository, { IWeightedCache } from './ImageIndexRepository.js';

/**
 * Aggregate root for creating a randomized and weighted list of images from the complete library.
 * 
 * @exports
 * @class CreateRandomizedListAggregateRoot
 */
export default class CreateRandomizedListAggregateRoot {

    private mediaImageService: MediaImageService;
    private comicsImageService: ComicsImageService;
    private gamesImageService: GamesImageService;

    constructor(private imageIndexRepository: ImageIndexRepository) {
        this.mediaImageService = new MediaImageService(PLEX_API, PLEX_API_KEY);
        this.comicsImageService = new ComicsImageService();
        this.gamesImageService = new GamesImageService(PLAYNITE_BACKUP_ORIGIN, PLAYNITE_BACKUP_IMAGE_FOLDER);
    }

    /**
     * Consumes a command to create a randomized and weighted list of images from a media library.
     * 
     * @param {CreateRandomizedListCommand} command
     * @returns {Promise<RandomizedListCreatedEvent | RandomizedListCreationFailedEvent>}
     * @memberof CreateRandomizedListAggregateRoot
     */
    async consume(command: CreateRandomizedListCommand): Promise<RandomizedListCreatedEvent | RandomizedListCreationFailedEvent> {

        const { userId, page, interval } = command.payload;

        try {
            // Check if library index caches are filled, else fetch data for each media type
            const hasValidCaches = this.imageIndexRepository.hasValidCaches(userId);
            if (!hasValidCaches) await this.#populateCaches(userId);

            // Check if weighted cache is filled, else create a weighted cache
            const hasValidWeightedCache = this.imageIndexRepository.hasValidWeightedCache(userId);
            if (!hasValidWeightedCache) this.#createWeightedCache(userId);

            // Return a business event
            return new RandomizedListCreatedEvent({ userId, page, interval, startTime: Date.now() });
        } catch (error: any) {
            // Return failure event
            const event = new RandomizedListCreationFailedEvent(error.message, error.url);
            error.event = event;
            return event;
        }
    }

    /**
     * Populates the caches for different media types.
     * 
     * @param {string} userId The ID of the user.
     */
    async #populateCaches(userId: string): Promise<void> {
        const invalidCaches = this.imageIndexRepository.getInvalidCacheHits(userId);

        // Fetch and save data for Komga
        if (mediaTypesKomga.some(type => invalidCaches.includes(type))) {
            const total = await this.comicsImageService.fetchTotalBooks();
            this.imageIndexRepository.save(userId, 'comics', { total });
        }

        // Fetch and save data for Playnite
        if (mediaTypesPlaynite.some(type => invalidCaches.includes(type))) {
            const data = await this.gamesImageService.fetchGamesData();
            this.imageIndexRepository.save(userId, 'games', { data });
        }

        // Fetch and save data for Plex
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
     * 
     * @param {string} userId The ID of the user.
     */
    #createWeightedCache(userId: string): void {
        const caches = this.imageIndexRepository.retrieve(userId);

        const cacheTotals = Object.values(caches).map(cache => cache.total);
        if (cacheTotals.length === 0) throw new Error("No media types available in cache.");

        const numberOfSets = Math.min(...cacheTotals);
        if (numberOfSets === 0) throw new Error("One of the media types has no available indexes.");

        // Distribute shuffled indexes into sets in a round-robin fashion
        const weightedSets: IWeightedCache[][] = Array.from({ length: numberOfSets }, () => []);
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
