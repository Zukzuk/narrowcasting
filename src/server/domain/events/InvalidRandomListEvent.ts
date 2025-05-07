import { WithTimestamp } from "../annotations/index.js";   
import { ISelectRandomImagePayload } from "../commands/SelectRandomImageCommand.js";

export const INVALID_RANDOMIZED_LIST_EVENT = 'INVALID_RANDOMIZED_LIST_EVENT' as const;

@WithTimestamp
export default class InvalidRandomListEvent {
    public static type = INVALID_RANDOMIZED_LIST_EVENT;
    type = INVALID_RANDOMIZED_LIST_EVENT;
    
    constructor(public payload: ISelectRandomImagePayload) {}
}