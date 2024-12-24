import { Timestamped } from "../../shared/annotations/index.js";   

export const CRAWL_COMMAND = 'CRAWL_COMMAND' as const;

@Timestamped
export default class CrawlCommand {
    public static type = CRAWL_COMMAND;
    type = CRAWL_COMMAND;
    constructor(public payload: { endpoint: string }) {}
}