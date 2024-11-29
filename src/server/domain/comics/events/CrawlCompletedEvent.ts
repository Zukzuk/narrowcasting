import { Timestamped } from "../../../domain/Annotations.js";

export const CRAWL_COMPLETED_EVENT = 'CRAWL_COMPLETED_EVENT' as const;

export type TCrawlCompletedPayload = Record<string, string>;

@Timestamped
export default class CrawlCompletedEvent {
    public static type = CRAWL_COMPLETED_EVENT;
    type = CRAWL_COMPLETED_EVENT;

    constructor(
        public payload: TCrawlCompletedPayload,
        public endpoint: string,
        public totalItems: number,
        public domain: string,
        public timestamp?: string
    ) {}
}
