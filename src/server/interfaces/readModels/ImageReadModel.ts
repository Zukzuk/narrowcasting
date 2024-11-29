import ImageRetrievedEvent, { TImageRetrievedPayload } from "../../domain/generic/events/ImageRetrievedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ImageReadModel {
    private cache: Record<string, any> = {
        latest: [],
    };

    constructor() {
        // subscribe to events
        broker.sub(ImageRetrievedEvent.type, event => {
            console.log('ImageReadModel: listen ->', event.type, event.domain);
            this.#denormalize(event);
        });
    }

    query(domain: string = 'latest'): TImageRetrievedPayload | null {
        if (!this.cache[domain]) return null;
        const payload = this.cache[domain][this.#last(domain)];

        console.log('ImageReadModel: query ->', domain);

        return payload;
    }

    #denormalize(event: ImageRetrievedEvent) {
        // denormalize
        if (!this.cache[event.domain]) this.cache[event.domain] = [];

        this.cache[event.domain].push(event.payload);
        if (this.cache[event.domain].length > 20) this.cache[event.domain].shift();

        this.cache.latest.push(event.payload);
        if (this.cache.latest.length > 20) this.cache.all.shift();
    }

    #last(domain: string): number {
        return this.cache[domain].length - 1;
    }
}