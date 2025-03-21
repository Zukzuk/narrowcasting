import { WithTimestamp } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const CRAWL_COMPLETED_EVENT = 'CRAWL_COMPLETED_EVENT' as const;

@WithTimestamp
export default class CrawlCompletedEvent {
    public static type = CRAWL_COMPLETED_EVENT;
    type = CRAWL_COMPLETED_EVENT;

    constructor(
        public payload: Record<string, string>,
        public endpoint: string,
        public mediaType: TMediaType,
        public timestamp?: string,
    ) {}
}
