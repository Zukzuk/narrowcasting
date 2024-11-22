export const CrawlCompletedEventType = 'CrawlCompletedEvent' as const;

export interface ICrawlCompletedData {
    endpoint: string;
    totalItems: number;
    payload: Record<string, string>;
    timestamp: string;
}

export class CrawlCompletedEvent {
    type = CrawlCompletedEventType;
    endpoint!: string;
    totalItems!: number;
    payload!: Record<string, string>;
    timestamp!: string;

    constructor(data: ICrawlCompletedData) {
        Object.assign(this, data);
    }
}
