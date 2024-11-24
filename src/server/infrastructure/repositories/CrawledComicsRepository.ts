export default class CrawledComicsRepository {
    private cache: Record<string, Record<string, string>>;
    private cacheLength: number;

    constructor() {
        this.cache = {};
        this.cacheLength = 0;
    }

    save(endpoint: string, data: any): Record<string, string> {
        if (!this.cache[endpoint]) this.cache[endpoint] = {};

        data.forEach((item: any) => {
            this.cache[endpoint][item.id] = item.name;
        });

        const payload = this.cache[endpoint];

        this.cacheLength = parseInt(payload.length, 10);

        this.log('save', endpoint, payload, new Date().toISOString());

        return payload;
    }

    retrieve(endpoint: string): Record<string, string> {
        const payload = this.cache[endpoint] || null;

        if (payload) this.log('retrieve', endpoint, payload, new Date().toISOString());

        return payload;
    }

    totalItems() {
        return this.cacheLength;
    }

    log(action: string, endpoint: string, payload: Record<string, string>, timestamp: string) {
        console.log(`CrawledComicsRepository: ${action}d ${Object.keys(payload).length} items for '${endpoint}' at ${timestamp}`);
    }
}
