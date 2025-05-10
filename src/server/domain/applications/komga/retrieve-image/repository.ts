import RetrieveImageCommand from '../../../commands/RetrieveImageCommand.js';
import RetrieveImageKomgaAggregateRoot, { TImageData } from './aggregate.js';
import { log, UrlError } from '../../../../utils.js';

/**
 * This repository is used to store the retrieved images from Komga.
 * 
 * @class RetrieveImageKomgaRepository
 */
export default class RetrieveImageKomgaRepository {
    private cache: { [userId: string]: TImageData | null } = {};
    private retrieveImage: RetrieveImageKomgaAggregateRoot = undefined as any;

    constructor() {}

    /**
     * Retrieve data from the cache and return the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @returns {Promise<RetrieveImageKomgaAggregateRoot>}
     */
    async get(command: RetrieveImageCommand): Promise<RetrieveImageKomgaAggregateRoot> {
        const userCache = this.#getUserCache(command);
        this.retrieveImage = new RetrieveImageKomgaAggregateRoot();
        this.retrieveImage.set(userCache);

        if (userCache) log('RetrieveImageKomgaRepository.retrieve()', 'read', `${Object.keys(userCache).length}`);

        return this.retrieveImage;
    }

    /**
     * Commit the data to the cache and update the aggregate.
     * 
     * @param {RetrieveImageCommand} command
     * @param {RetrieveImageKomgaAggregateRoot} retrieveImage
     * @returns {Promise<RetrieveImageKomgaAggregateRoot>}
     */
    async commit(command: RetrieveImageCommand): Promise<RetrieveImageKomgaAggregateRoot> {
        try {
            // Save the uncommitted data to the cache.
            const uncommittedData = this.retrieveImage.getUncommittedData();
            if (uncommittedData) {
                this.#setUserCache(command, uncommittedData);
                // Update the aggregate.
                const userCache = this.#getUserCache(command);
                await this.retrieveImage.update(command, userCache);
                log('RetrieveImageKomgaRepository.commmit()', 'write', `${userCache ? Object.keys(userCache).length : 'empty'}`);
            }

            return this.retrieveImage;
        } catch (error: any) {
            // Update the aggregate with the error.
            this.retrieveImage.update(command, undefined, error as Error);
            return this.retrieveImage;
        }
    }

    /**
     * Get the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @returns {TImageData | null}
     */
    #getUserCache(command: RetrieveImageCommand): TImageData | null {
        const { userId } = command.payload;
        return this.cache[userId] || null;
    }

    /**
     * Get the user's cache.
     * 
     * @private
     * @param {RetrieveImageCommand} command
     * @param {TImageData | null} uncommittedData
     */
    #setUserCache(command: RetrieveImageCommand, uncommittedData: TImageData | null): void {
        const { userId } = command.payload;
        this.cache[userId] = uncommittedData;
    }
}
