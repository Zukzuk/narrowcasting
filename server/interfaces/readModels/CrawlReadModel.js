class CrawlReadModel {
    constructor() {
        this.cache = {};
    }

    onCrawlCompleted(event) {
        console.log(event.type, event.endpoint);
        // denormalize
        this.cache[event.endpoint] = event.payload;
    }

    query({endpoint, search}) {
        const payload = this.cache[endpoint] || {};
        if (!search) return payload;
        // Create a case-insensitive fuzzy matching pattern allowing for variations
        const pattern = new RegExp(search.split(" ").join(".*"), "i");
        // Filter the payload with generalized fuzzy matching
        return Object.keys(payload)
            .filter(key => pattern.test(payload[key]))
            .reduce((acc, key) => {
                acc[key] = payload[key];
                return acc;
            }, {});
    }
}

module.exports = CrawlReadModel;
