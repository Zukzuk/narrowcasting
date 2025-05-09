import { WithTimestamp } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const HANDLER_FAILED_EVENT = 'HANDLER_FAILED_EVENT' as const;

@WithTimestamp
export default class HandlerFailedEvent {
    public static type = HANDLER_FAILED_EVENT;
    type = HANDLER_FAILED_EVENT;

    constructor(
        public error: any,
        public timestamp?: string,
    ) { }
}
