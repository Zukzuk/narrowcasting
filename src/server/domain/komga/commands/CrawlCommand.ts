import { CRAWL_COMMAND, ICommand } from "./Command.js";

interface ICrawlCommandData {
    payload: { endpoint: string };
    timestamp: string;
}

export class CrawlCommand implements ICommand {
    type = CRAWL_COMMAND;
    payload!: { endpoint: string };
    timestamp?: string;

    constructor(data: ICrawlCommandData) {
        Object.assign(this, data);
    }
}