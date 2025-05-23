import RetrieveImageCommand from '../../../commands/RetrieveImageCommand.js';
import RetrieveImageKomgaAggregateRoot, { TKomgaImageData } from './aggregate.js';
import { EKomgaMediaType } from './aggregate.js';
import { log } from '../../../../utils.js';

/**
 * This repository is used to store the retrieved images from Komga.
 * 
 * @class RetrieveImageKomgaRepository
 */
export default class RetrieveImageKomgaRepository {
    private cache: { [userId: string]: TKomgaImageData } = {};
    private retrieveImage: RetrieveImageKomgaAggregateRoot = undefined as any;

    constructor() {}

    /**
     * Retrieve data from the cache and return the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<RetrieveImageKomgaAggregateRoot>}
     */
    async get(command: RetrieveImageCommand): Promise<RetrieveImageKomgaAggregateRoot> {
        const _cache = this.#read(command);
        this.retrieveImage = new RetrieveImageKomgaAggregateRoot(command);
        this.retrieveImage.set(_cache);

        if (_cache) log('RetrieveImageKomgaRepository.get()', 'read', `${_cache.url}`);
        return this.retrieveImage;
    }

    /**
     * Commit the data to the cache and update the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<RetrieveImageKomgaAggregateRoot>}
     */
    async commit(command: RetrieveImageCommand): Promise<RetrieveImageKomgaAggregateRoot> {
        try {
            // Save the uncommitted data to the cache.
            const uncommittedData = this.retrieveImage.getUncommittedData();
            if (uncommittedData) {
                this.#update(command, uncommittedData);
                // Update the aggregate.
                const _cache = this.#read(command);
                await this.retrieveImage.update(_cache);
                log('RetrieveImageKomgaRepository.commmit()', 'write', `${_cache.url}`);
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
     * @returns {TKomgaImageData}
     */
    #read(command: RetrieveImageCommand): TKomgaImageData {
        const { userId } = command.payload;
        return this.cache[userId];
    }

    /**
     * Update the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @param {TKomgaImageData} uncommittedData
     */
    #update(command: RetrieveImageCommand, uncommittedData: TKomgaImageData): void {
        const { userId } = command.payload;
        this.cache[userId] = uncommittedData;
    }
}
