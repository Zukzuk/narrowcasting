import { CRAWL_COMPLETED_EVENT, ISuccessEvent } from "../../../domain/Event.js";

interface ICrawlCompletedEventData {
    endpoint: string;
    totalItems: number;
    payload: Record<string, string>;
    timestamp?: string;
}

export default class CrawlCompletedEvent implements ISuccessEvent {
    public static type = CRAWL_COMPLETED_EVENT;
    public get type() {
        return CRAWL_COMPLETED_EVENT;
    }

    payload!: Record<string, string>;
    endpoint!: string;
    totalItems!: number;
    timestamp?: string;

    constructor(data: ICrawlCompletedEventData) {
        Object.assign(this, data);
    }
}
