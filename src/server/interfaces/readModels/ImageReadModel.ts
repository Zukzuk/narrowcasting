import { TMediaType } from "../../domain/shared/types/index.js";
import ImageRetrievedEvent, { TImageRetrievedPayload } from "../../domain/shared/events/ImageRetrievedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ImageReadModel {
    
    private cache: Record<string, any> = {
        latest: [],
    };

    constructor() {
        // subscribe to events
        broker.sub(ImageRetrievedEvent.type, event => {
            console.log('ImageReadModel: listen ->', event.type, event.mediaType);
            this.#denormalize(event);
        });
    }

    query(mediaType: TMediaType | 'latest' = 'latest'): TImageRetrievedPayload | null {
        if (!this.cache[mediaType]) return null;
        const payload = this.cache[mediaType][this.#last(mediaType)];

        console.log('ImageReadModel: query ->', mediaType);

        return payload;
    }

    #denormalize(event: ImageRetrievedEvent) {
        if (!this.cache[event.mediaType]) this.cache[event.mediaType] = [];

        this.cache[event.mediaType].push(event.payload);
        if (this.cache[event.mediaType].length > 20) this.cache[event.mediaType].shift();

        this.cache.latest.push(event.payload);
        if (this.cache.latest.length > 20) this.cache.all.shift();
    }

    #last(mediaType: TMediaType | 'latest'): number {
        return this.cache[mediaType].length - 1;
    }
}