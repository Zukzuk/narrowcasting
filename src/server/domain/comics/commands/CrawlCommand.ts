import { CRAWL_COMMAND, ICommand } from "../../../domain/Command.js";

interface ICrawlCommandData {
    payload: { endpoint: string };
    timestamp?: string;
}

export default class CrawlCommand implements ICommand {
    public static type = CRAWL_COMMAND;
    public get type() {
        return CRAWL_COMMAND;
    }

    payload!: { endpoint: string };
    timestamp?: string;

    constructor(data: ICrawlCommandData) {
        Object.assign(this, data);
    }
}