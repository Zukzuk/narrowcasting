import { WithTimestamp } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const CRAWL_FAILED_EVENT = 'CRAWL_FAILED_EVENT' as const;

@WithTimestamp
export default class CrawlFailedEvent {
    public static type = CRAWL_FAILED_EVENT;
    type = CRAWL_FAILED_EVENT;

    constructor(
        public error: any,
        public url: string,
        public endpoint: string,
        public mediaType: TMediaType,
        public timestamp?: string,
    ) {}
}
