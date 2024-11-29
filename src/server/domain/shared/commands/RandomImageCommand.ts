import { Timestamped } from "../../../domain/Annotations.js";   

export const RANDOM_IMAGE_COMMAND = 'RANDOM_IMAGE_COMMAND' as const;

@Timestamped
export default class RandomImageCommand {
    public static type = RANDOM_IMAGE_COMMAND;
    type = RANDOM_IMAGE_COMMAND;
    constructor(public payload: { page: number, interval: number }) {}
}