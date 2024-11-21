import { APP_VERSION_TAG } from '../../config.js';

class CrawlReadModel {
    constructor() {
        this.version = APP_VERSION_TAG;
    }

    query() {
        return this.version || '0.0.0';
    }
}

export default CrawlReadModel;
