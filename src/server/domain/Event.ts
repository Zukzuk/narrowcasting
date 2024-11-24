export const CRAWL_COMPLETED_EVENT = 'CRAWL_COMPLETED_EVENT' as const;
export const CRAWL_FAILED_EVENT = 'CRAWL_FAILED_EVENT' as const;
export const IMAGE_RETRIEVED_EVENT = 'IMAGE_RETRIEVED_EVENT' as const;
export const IMAGE_RETRIEVAL_FAILED_EVENT = 'IMAGE_RETRIEVAL_FAILED_EVENT' as const;

export interface ISuccessEvent {
    type:
    typeof CRAWL_COMPLETED_EVENT |
    typeof IMAGE_RETRIEVED_EVENT;
    payload: any;
}

export interface IFailedEvent {
    type: 
    typeof CRAWL_FAILED_EVENT | 
    typeof IMAGE_RETRIEVAL_FAILED_EVENT;
    error: any;
}