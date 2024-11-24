export const CRAWL_COMMAND = 'CRAWL_COMMAND' as const;
export const RANDOM_IMAGE_COMMAND = 'RANDOM_IMAGE_COMMAND' as const;

export interface ICommand {
    type: 
    typeof CRAWL_COMMAND | 
    typeof RANDOM_IMAGE_COMMAND;
    payload: any;
}