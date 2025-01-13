import { Timestamped } from "../annotations/index.js";   
import { IRandomImageSelectedPayload } from "../events/RandomImageSelectedEvent.js";

export const RETRIEVE_IMAGE_COMMAND = 'RETRIEVE_IMAGE_COMMAND' as const;

@Timestamped
export default class RandomImageCommand {
    public static type = RETRIEVE_IMAGE_COMMAND;
    type = RETRIEVE_IMAGE_COMMAND;
    constructor(
        public payload: IRandomImageSelectedPayload,
        public timestamp?: string,
    ) {}
}