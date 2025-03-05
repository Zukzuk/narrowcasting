import { WithTimestamp } from "../annotations/index.js";   

export const CRAWL_ENDPOINT_COMMAND = 'CRAWL_ENDPOINT_COMMAND' as const;

export interface ICrawlEndpointPayload {
    userId: string;
    endpoint: string 
}

@WithTimestamp
export default class Endpoint {
    public static type = CRAWL_ENDPOINT_COMMAND;
    type = CRAWL_ENDPOINT_COMMAND;
    
    constructor(public payload: ICrawlEndpointPayload) {}
}