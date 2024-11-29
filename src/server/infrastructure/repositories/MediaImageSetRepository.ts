import { IPlexMediaContainer } from "../../domain/media/services/MediaImageService.js";

export default class MediaImageSetRepository {
    private set: Record<string, number[]>;
    private data: Record<string, IPlexMediaContainer[]>;
    private total: Record<string, number>;
    private expiration: Record<string, number>;

    constructor(private APP_CACHE_DURATION: number) {
        this.set = {};
        this.data = {};
        this.total = {};
        this.expiration = {};
    }

    save(domain: string, data: IPlexMediaContainer[]): number[] {
        this.total[domain] = data.length;
        this.set[domain] = Array.from({ length: this.total[domain] }, (_, i) => i);
        this.data[domain] = data;
        this.expiration[domain] = Date.now() + this.APP_CACHE_DURATION;

        this.#log('save', `${domain} with length ${this.retrieveNumInSet(domain)}`, new Date().toISOString());

        return this.set[domain];
    }

    retrieveData(domain: string, index: number): IPlexMediaContainer {
        return this.data[domain][index];
    }

    retrieveSet(domain: string): number[] {
        const payload = (Date.now() < this.expiration[domain]) ? this.set[domain] : [];

        this.#log('retrieve', `${domain} with length ${this.retrieveNumInSet(domain)}`, new Date().toISOString());

        return payload;
    }

    retrieveFromSet(domain: string): number {
        if (!this.set[domain]) return -1;
        const index = Math.floor(Math.random() * this.set[domain].length);
        this.set[domain] = this.#shuffleArray(this.set[domain]);
        const value = this.set[domain].splice(index, 1)[0];

        this.#log('retrieveFromSet', `${index}:${value} from ${domain} with length ${this.retrieveNumInSet(domain)}`, new Date().toISOString());

        return value;
    }

    retrieveTotal(domain: string): number {
        return this.total[domain];
    }

    retrieveNumInSet(domain: string): number {
        return (this.set[domain]) ? this.set[domain].length : 0;
    }

    #log(action: string, value: any, timestamp: string) {
        console.log(`MediaImageSetRepository: ${action} -> ${value} at ${timestamp}`);
    }

    #shuffleArray(array: number[]): number[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
