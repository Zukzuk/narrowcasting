import { Timestamped } from "../annotations/index.js";   

export const CRAWL_COMMAND = 'CRAWL_COMMAND' as const;

export interface ICrawlPayload {
    userId: string;
    endpoint: string 
}

@Timestamped
export default class CrawlCommand {
    public static type = CRAWL_COMMAND;
    type = CRAWL_COMMAND;
    
    constructor(public payload: ICrawlPayload) {}
}