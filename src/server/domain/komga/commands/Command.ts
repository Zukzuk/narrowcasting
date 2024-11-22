export const CRAWL_COMMAND = 'CRAWL_COMMAND' as const;
export const OTHER_COMMAND = 'OTHER_COMMAND' as const;

export interface ICommand {
    type: typeof CRAWL_COMMAND | typeof OTHER_COMMAND;
    payload: any;
}