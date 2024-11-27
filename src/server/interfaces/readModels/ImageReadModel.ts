import ImageRetrievedEvent, { IImageRetrievedPayload } from "../../domain/comics/events/ImageRetrievedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ImageReadModel {
    private cache: Record<string, any> = {};

    constructor() {
        // subscribe to events
        broker.sub(ImageRetrievedEvent.type, event => this.#denormalize(event));
    }

    query({ domain }: { domain: string }): IImageRetrievedPayload | null {
        if (!this.cache[domain]) return null;
        return this.cache[domain][this.#last(domain)];
    }

    #denormalize(event: ImageRetrievedEvent) {
        console.log('ImageReadModel:', event.type, event.domain);
        // denormalize
        if (!this.cache[event.domain]) this.cache[event.domain] = [];
        this.cache[event.domain].push(event.payload);
        if (this.cache[event.domain].length > 20) this.cache[event.domain].shift();
    }

    #last(domain: string): number {
        return this.cache[domain].length - 1;
    }
}