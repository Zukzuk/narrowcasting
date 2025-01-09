import { APP_VERSION_TAG } from '../../config.js';

/**
 * This class is responsible for handling the read model of the Crawl domain.
 * 
 * @export
 * @class CrawlReadModel
 */
export default class CrawlReadModel {
    
    private version: string;
    
    constructor() {
        this.version = APP_VERSION_TAG;
    }

    /**
     * This method queries the read model for the Crawl domain.
     * 
     * @returns {string}
     * @memberof CrawlReadModel
     */
    query() {
        return this.version || '0.0.0';
    }
}
