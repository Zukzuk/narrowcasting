import { Timestamped } from "../../../domain/Annotations.js";

export const CRAWL_FAILED_EVENT = 'CRAWL_FAILED_EVENT' as const;

@Timestamped
export default class CrawlFailedEvent {
    public static type = CRAWL_FAILED_EVENT;
    type = CRAWL_FAILED_EVENT;

    constructor(
        public error: any,
        public endpoint: string,
        public url: string,
        public domain: string,
        public timestamp?: string
    ) {}
}
