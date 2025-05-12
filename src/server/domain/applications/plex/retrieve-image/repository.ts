import RetrieveImageCommand from '../../../commands/RetrieveImageCommand.js';
import RetrieveImagePlexAggregateRoot, { TPlexImageData } from './aggregate.js';
import { log } from '../../../../utils.js';

/**
 * This repository is used to store the retrieved images from Plex.
 * 
 * @class RetrieveImagePlexRepository
 */
export default class RetrieveImagePlexRepository {
    private cache: { [userId: string]: TPlexImageData } = {};
    private retrieveImage: RetrieveImagePlexAggregateRoot = undefined as any;

    constructor() {}

    /**
     * Retrieve data from the cache and return the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<RetrieveImagePlexAggregateRoot>}
     */
    async get(command: RetrieveImageCommand): Promise<RetrieveImagePlexAggregateRoot> {
        const _cache = this.#read(command);
        this.retrieveImage = new RetrieveImagePlexAggregateRoot(command);
        this.retrieveImage.set(_cache);

        if (_cache) log('RetrieveImagePlexRepository.get()', 'read', `${_cache.url}`);
        return this.retrieveImage;
    }

    /**
     * Commit the data to the cache and update the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<RetrieveImagePlexAggregateRoot>}
     */
    async commit(command: RetrieveImageCommand): Promise<RetrieveImagePlexAggregateRoot> {
        try {
            // Save the uncommitted data to the cache.
            const uncommittedData = this.retrieveImage.getUncommittedData();
            if (uncommittedData) {
                this.#update(command, uncommittedData);
                // Update the aggregate.
                const _cache = this.#read(command);
                await this.retrieveImage.update(_cache);
                log('RetrieveImagePlexRepository.commmit()', 'write', `${_cache.url}`);
            }
            return this.retrieveImage;
        } catch (error: any) {
            // Update the aggregate with the error.
            this.retrieveImage.update(undefined, error as Error);
            return this.retrieveImage;
        }
    }

    /**
     * Get the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @returns {TImageData}
     */
    #read(command: RetrieveImageCommand): TPlexImageData {
        const { userId } = command.payload;
        return this.cache[userId];
    }

    /**
     * Update the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @param {TPlexImageData} uncommittedData
     */
    #update(command: RetrieveImageCommand, uncommittedData: TPlexImageData): void {
        const { userId } = command.payload;
        this.cache[userId] = uncommittedData;
    }
}
