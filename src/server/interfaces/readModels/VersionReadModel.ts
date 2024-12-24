import { APP_VERSION_TAG } from '../../config.js';

export default class CrawlReadModel {
    
    private version: string;
    
    constructor() {
        this.version = APP_VERSION_TAG;
    }

    query() {
        return this.version || '0.0.0';
    }
}
