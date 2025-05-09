import { WithTimestamp } from "../annotations/index.js";   

export const CRAWL_COMICS_COMMAND = 'CRAWL_COMICS_COMMAND' as const;

export interface ICrawlComicsPayload {
    userId: string;
    endpoint: 'collections' | 'series';
}

@WithTimestamp
export default class CrawlComicsCommand {
    public static type = CRAWL_COMICS_COMMAND;
    type = CRAWL_COMICS_COMMAND;
    
    constructor(public payload: ICrawlComicsPayload) {}
}