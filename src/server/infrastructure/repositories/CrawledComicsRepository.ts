export default class CrawledComicsRepository {
    private cache: Record<string, Record<string, string>>;

    constructor() {
        this.cache = {};
    }

    save(endpoint: string, data: any): Record<string, string> {
        if (!this.cache[endpoint]) this.cache[endpoint] = {};
        data.forEach((item: any) => {
            this.cache[endpoint][item.id] = item.name;
        });
        const payload = this.cache[endpoint];

        this.log('save', endpoint, payload);

        return payload;
    }

    retrieve(endpoint: string): Record<string, string> {
        const payload = this.cache[endpoint] || null;

        if (payload) this.log('retrieve', endpoint, payload);

        return payload;
    }

    log(action: string, endpoint: string, payload: Record<string, string>) {
        console.log(`CrawledComicsRepository: ${action} -> ${Object.keys(payload).length} items for '${endpoint}'`);
    }
}
