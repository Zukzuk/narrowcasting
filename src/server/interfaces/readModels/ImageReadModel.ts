import { log } from "../../utils.js";
import { TMediaType } from "../../domain/shared/types/index.js";
import { IImageRetrievedPayload, IMAGE_RETRIEVED_EVENT } from "../../domain/shared/events/ImageRetrievedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

interface ICacheData {
    [mediaType: string]: IImageRetrievedPayload[],
    latest: IImageRetrievedPayload[]
};

export interface IImageQuery {
    userId: string,
    mediaType: TMediaType | 'latest'
};

export default class ImageReadModel {

    private cache: { [userId: string]: ICacheData } = {};

    constructor() {
        // subscribe to events
        broker.sub(IMAGE_RETRIEVED_EVENT, event => {
            console.log('ImageReadModel:: logging: listen ->', event.type, event.payload.mediaType);
            this.#denormalize(event.payload);
        });
    }

    query({ userId, mediaType }: IImageQuery): IImageRetrievedPayload | null {
        const userCache = this.#getUserCache(userId);

        if (!userCache[mediaType]) return null;
        const payload = userCache[mediaType][this.#last(userCache, mediaType)];

        log(userId, 'ImageReadModel', 'query', 'read', mediaType);

        return payload;
    }

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

    #last(userCache: ICacheData, mediaType: TMediaType | 'latest'): number {
        return userCache[mediaType].length - 1;
    }

    #getUserCache(userId: string): ICacheData {
        if (!this.cache[userId]) {
            this.cache[userId] = { latest: [] };
        }
        return this.cache[userId];
    }
}