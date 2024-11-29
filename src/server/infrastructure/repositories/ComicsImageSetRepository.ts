export default class ComicImagesSetRepository {
    private set: number[];
    private total: number;
    private expiration: number;

    constructor(private APP_CACHE_DURATION: number) {
        this.set = [];
        this.total = 0;
        this.expiration = 0;
    }

    save(total: number): number[] {
        this.set = Array.from({ length: total }, (_, i) => i);
        this.total = total;
        this.expiration = Date.now() + this.APP_CACHE_DURATION;

        this.#log('save', `set with length ${this.retrieveNumInSet()}`, new Date().toISOString());

        return this.set;
    }

    retrieve(): number[] {
        const payload = (Date.now() < this.expiration) ? this.set : [];

        this.#log('retrieve', `set with length ${this.retrieveNumInSet()}`, new Date().toISOString());

        return payload;
    }

    retrieveFromSet(): number {
        if (!this.set) return -1;
        const index = Math.floor(Math.random() * this.set.length);
        this.set = this.#shuffleArray(this.set)
        const value = this.set.splice(index, 1)[0];

        this.#log('retrieveFromSet', `${index}:${value} from set with length ${this.retrieveNumInSet()}`, new Date().toISOString());

        return value;
    }

    retrieveTotal(): number {
        return this.total;
    }

    retrieveNumInSet(): number {
        return (this.set) ? this.set.length : 0;
    }

    #log(action: string, value: any, timestamp: string) {
        console.log(`ComicsImageSetRepository: ${action} -> ${value} at ${timestamp}`);
    }

    #shuffleArray(array: number[]): number[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
