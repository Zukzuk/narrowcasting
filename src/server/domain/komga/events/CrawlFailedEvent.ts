export const CrawlFailedEventType = 'CrawlFailedEvent' as const;

export interface ICrawlFailedData {
    endpoint: string;
    url: string;
    error: any;
    timestamp: string;
}

export class CrawlFailedEvent {
    type = CrawlFailedEventType;
    endpoint!: string;
    url!: string;
    error!: any; // Replace `any` with a specific error type if needed
    timestamp!: string;

    constructor(data: ICrawlFailedData) {
        Object.assign(this, data);
    }
}
