import { Timestamped } from "../annotations/index.js";   

export const SELECT_RANDOM_IMAGE_COMMAND = 'SELECT_RANDOM_IMAGE_COMMAND' as const;

@Timestamped
export default class SelectRandomImageCommand {
    public static type = SELECT_RANDOM_IMAGE_COMMAND;
    type = SELECT_RANDOM_IMAGE_COMMAND;
    constructor(public payload: { page: number, interval: number }) {}
}