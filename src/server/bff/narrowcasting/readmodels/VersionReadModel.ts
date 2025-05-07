import { APP_VERSION_TAG } from '../../../config.js';

/**
 * @class VersionReadModel
 */
export default class VersionReadModel {
    
    private version: string;
    
    constructor() {
        this.version = APP_VERSION_TAG;
    }

    /**
     * @returns {string}
     * @memberof VersionReadModel
     */
    query() {
        return this.version || '0.0.0';
    }
}
