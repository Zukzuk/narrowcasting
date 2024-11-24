export default class TotalComicsRepository<T> {
    private cache: { value: T | null; expiration: number } = { value: null, expiration: 0 };
    private duration: number;

    constructor(duration: number = 0) {
        this.duration = duration;
    }

    save(data: T): T {
        const currentTime = Date.now();
        this.cache.value = data;
        this.cache.expiration = currentTime + this.duration;
        return data;
    }
    
    retrieve(): T | null {
        const currentTime = Date.now();
        return currentTime < this.cache.expiration ? this.cache.value : null;
    }
}
