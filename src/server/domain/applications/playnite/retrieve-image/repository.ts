import RetrieveImageCommand from '../../../commands/RetrieveImageCommand.js';
import RetrieveImagePlayniteAggregateRoot, { TPlayniteImageData } from './aggregate.js';
import { log } from '../../../../utils.js';

/**
 * This repository is used to store the retrieved images from Playnite.
 * 
 * @class RetrieveImagePlayniteRepository
 */
export default class RetrieveImagePlayniteRepository {
    private cache: { [userId: string]: TPlayniteImageData } = {};
    private retrieveImage: RetrieveImagePlayniteAggregateRoot = undefined as any;

    constructor() {}

    /**
     * Retrieve data from the cache and return the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<RetrieveImagePlayniteAggregateRoot>}
     */
    async get(command: RetrieveImageCommand): Promise<RetrieveImagePlayniteAggregateRoot> {
        const _cache = this.#read(command);
        this.retrieveImage = new RetrieveImagePlayniteAggregateRoot(command);
        this.retrieveImage.set(_cache);

        if (_cache) log('RetrieveImagePlayniteRepository.get()', 'read', `${_cache.url}`);
        return this.retrieveImage;
    }

    /**
     * Commit the data to the cache and update the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<RetrieveImagePlayniteAggregateRoot>}
     */
    async commit(command: RetrieveImageCommand): Promise<RetrieveImagePlayniteAggregateRoot> {
        try {
            // Save the uncommitted data to the cache.
            const uncommittedData = this.retrieveImage.getUncommittedData();
            if (uncommittedData) {
                this.#update(command, uncommittedData);
                // Update the aggregate.
                const _cache = this.#read(command);
                await this.retrieveImage.update(_cache);
                log('RetrieveImagePlayniteRepository.commmit()', 'write', `${_cache.url}`);
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
    #read(command: RetrieveImageCommand): TPlayniteImageData {
        const { userId } = command.payload;
        return this.cache[userId];
    }

    /**
     * Update the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @param {TPlayniteImageData} uncommittedData
     */
    #update(command: RetrieveImageCommand, uncommittedData: TPlayniteImageData): void {
        const { userId } = command.payload;
        this.cache[userId] = uncommittedData;
    }
}
