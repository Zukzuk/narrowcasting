class CacheRepository {
    constructor() {
        this.cache = {};
        this.cacheLength = 0;
    }

    save(endpoint, data) {
        if (!this.cache[endpoint]) this.cache[endpoint] = {};

        data.forEach(item => {
            this.cache[endpoint][item.id] = item.name;
        });

        const payload = this.cache[endpoint];

        this.cacheLength = payload.length;

        this.log('save', endpoint, payload, new Date().toISOString());

        return payload;
    }

    retrieve(endpoint) {
        const payload = this.cache[endpoint] || null;

        if (payload) this.log('retrieve', endpoint, payload, new Date().toISOString());

        return payload;
    }

    totalItems() {
        return this.cacheLength;
    }

    log(action, endpoint, payload, timestamp) {
        console.log(`CacheRepository: ${action}d ${Object.keys(payload).length} items for '${endpoint}' at ${timestamp}`);
    }
}

module.exports = CacheRepository;
