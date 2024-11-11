const { VERSION_TAG } = require('../../config');

class CrawlReadModel {
    constructor() {
        this.version = VERSION_TAG;
    }

    query() {
        return this.version || '0.0.0';
    }
}

module.exports = CrawlReadModel;
