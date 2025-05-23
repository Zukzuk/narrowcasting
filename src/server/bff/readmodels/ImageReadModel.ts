import { log } from "../../utils.js";
import { TMediaType } from "../../domain/types/index.js";
import { IImageRetrievedPayload, IMAGE_RETRIEVED_EVENT } from "../../domain/events/ImageRetrievedEvent.js";

import broker from "../../infrastructure/BrokerSingleton.js";

interface ICacheData {
    [mediaType: string]: IImageRetrievedPayload[],
    latest: IImageRetrievedPayload[]
};

export interface IImageQuery {
    userId: string,
    mediaType: TMediaType | 'latest'
};

/**
 * This class is responsible for handling the read model of the Image domain.
 * 
 * @class ImageReadModel
 */
export default class ImageReadModel {

    private cache: { [userId: string]: ICacheData } = {};

    constructor() {
        // subscribe to events
        log('ImageReadModel.constructor()', 'subscribe', `
            \t${IMAGE_RETRIEVED_EVENT}
        `);
        broker.sub(IMAGE_RETRIEVED_EVENT, event => {
            log('ImageReadModel.sub()', 'listen', `${event.type}: ${event.payload.mediaType}`);
            this.#denormalize(event.payload);
        });
    }

    /**
     * This method queries the read model for the Image domain.
     * 
     * @param {IImageQuery} { userId, mediaType }
     * @returns {IImageRetrievedPayload | null}
     */
    query({ userId, mediaType }: IImageQuery): IImageRetrievedPayload | null {
        const userCache = this.#getUserCache(userId);

        if (!userCache[mediaType]) return null;
        const payload = userCache[mediaType][this.#last(userCache, mediaType)];

        log('ImageReadModel.query()', 'read', mediaType, userId);

        return payload;
    }

    /**
     * This method queries the read model for the Image domain.
     * 
     * @private
     * @param {IImageQuery} { userId, mediaType }
     */
    #denormalize(payload: IImageRetrievedPayload) {
        const userCache = this.#getUserCache(payload.userId);

        // push to that user's mediaType array
        if (!userCache[payload.mediaType]) userCache[payload.mediaType] = [];
        userCache[payload.mediaType].push(payload);
        if (userCache[payload.mediaType].length > 20) userCache[payload.mediaType].shift();

        // also push to 'latest'
        userCache.latest.push(payload);
        if (userCache.latest.length > 20) userCache.latest.shift();
    }

    /**
     * This method returns the last index of the userCache.
     * 
     * @private
     * @param {ICacheData} userCache
     * @param {(TMediaType | 'latest')} mediaType
     * @returns {number}
     */
    #last(userCache: ICacheData, mediaType: TMediaType | 'latest'): number {
        return userCache[mediaType].length - 1;
    }

    /**
     * This method returns the userCache.
     * 
     * @private
     * @param {string} userId
     * @returns {ICacheData}
     */
    #getUserCache(userId: string): ICacheData {
        if (!this.cache[userId]) {
            this.cache[userId] = { latest: [] };
        }
        return this.cache[userId];
    }
}