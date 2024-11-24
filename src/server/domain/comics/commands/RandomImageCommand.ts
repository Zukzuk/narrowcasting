import { RANDOM_IMAGE_COMMAND, ICommand } from "../../../domain/Command.js";

interface IRandomImageCommandData {
    payload: { page: number, interval: number };
    timestamp?: string;
}

export default class RandomImageCommand implements ICommand {
    public static type = RANDOM_IMAGE_COMMAND;
    public get type() {
        return RANDOM_IMAGE_COMMAND;
    }
    
    payload!: { page: number, interval: number };
    timestamp?: string;

    constructor(data: IRandomImageCommandData) {
        Object.assign(this, data);
    }
}