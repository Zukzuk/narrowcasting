import { WithTimestamp } from "../annotations/index.js";

export const SELECT_RANDOM_IMAGE_COMMAND = 'SELECT_RANDOM_IMAGE_COMMAND' as const;

export interface ISelectRandomImagePayload {
    userId: string;
    page: number;
    interval: number;
    startTime: number;
}

@WithTimestamp
export default class SelectRandomImageCommand {
    public static type = SELECT_RANDOM_IMAGE_COMMAND;
    type = SELECT_RANDOM_IMAGE_COMMAND;
    
    constructor(public payload: ISelectRandomImagePayload) { }
}