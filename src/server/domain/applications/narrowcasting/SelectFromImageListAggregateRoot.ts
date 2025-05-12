import { mediaTypesPlex, mediaTypesPlaynite } from '../../types/index.js';
import { log } from '../../../utils.js';
import SelectRandomImageCommand from '../../commands/SelectRandomImageCommand.js';
import InvalidRandomListEvent from '../../events/InvalidRandomListEvent.js';
import RandomImageSelectedEvent from '../../events/RandomImageSelectedEvent.js';
import RandomImageSelectionFailedEvent from '../../events/RandomImageSelectionFailedEvent.js';
import { IPlayniteGamesContainer } from '../playnite/retrieve-image/retrieve-cover.service.js';
import { IPlexMediaContainer } from '../plex/retrieve-image/retrieve-cover.service.js';
import ImageIndexRepository from './ImageIndexRepository.js';

/**
 * Aggregate root for selecting a random image from a media library.
 * 
 * @exports
 * @class SelectFromImageListAggregateRoot
 */
export default class SelectFromImageListAggregateRoot {

    constructor(private imageIndexRepository: ImageIndexRepository) { }

    /**
     * Consumes a command to select a random image from a media library.
     * 
     * @param {SelectRandomImageCommand} command
     * @returns {Promise<RandomImageSelectedEvent | RandomImageSelectionFailedEvent>}
     */
    async consume(command: SelectRandomImageCommand): Promise<InvalidRandomListEvent | RandomImageSelectedEvent | RandomImageSelectionFailedEvent> {

        const { userId, page, interval, startTime } = command.payload;

        try {
            // Check if library index caches are filled, else fetch data for each media type
            const hasValidCaches = this.imageIndexRepository.hasValidCaches(userId);
            const hasValidWeightedCache = this.imageIndexRepository.hasValidWeightedCache(userId);

            if (!hasValidCaches || !hasValidWeightedCache) {
                // Return a business event
                return new InvalidRandomListEvent({ userId, page, interval, startTime });
            }

            // Retrieve the weighted index using the repository method
            const { mediaType, index } = this.imageIndexRepository.getWeightedItem(userId);
            let metaData: IPlexMediaContainer | IPlayniteGamesContainer | undefined;
            if (mediaTypesPlex.some(type => type === mediaType)) {
                metaData = this.imageIndexRepository.retrieveData(userId, mediaType, index) as IPlexMediaContainer;
            } else if (mediaTypesPlaynite.some(type => type === mediaType)) {
                metaData = this.imageIndexRepository.retrieveData(userId, mediaType, index) as IPlayniteGamesContainer;
            }
            // Return a business event
            return new RandomImageSelectedEvent({ userId, index, mediaType, page, interval, startTime }, metaData);
        } catch (error: any) {
            // Return failure event
            const event = new RandomImageSelectionFailedEvent(error.message, error.url);
            error.event = event;
            return event;
        }
    }
}
