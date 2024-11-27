import { CRAWL_FAILED_EVENT, IFailedEvent } from "../../../domain/Event.js";

interface ICrawlFailedEventData {
    endpoint: string;
    url: string;
    error: any;
    domain: string;
    timestamp?: string;
}

export default class CrawlFailedEvent implements IFailedEvent {
    public static type = CRAWL_FAILED_EVENT;
    public get type() {
        return CRAWL_FAILED_EVENT;
    }

    error!: any; // Replace `any` with a specific error type if needed
    endpoint!: string;
    url!: string;
    domain!: string;
    timestamp?: string;

    constructor(data: ICrawlFailedEventData) {
        Object.assign(this, data);
    }
}
