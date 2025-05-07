import { WithTimestamp } from "../annotations/index.js";
import { ISelectRandomImagePayload } from "../commands/SelectRandomImageCommand.js";

export const RETRY_IMAGE_RETRIEVAL_EVENT = 'RETRY_IMAGE_RETRIEVAL_EVENT' as const;

@WithTimestamp
export default class RetryImageRetrievalEvent {
    public static type = RETRY_IMAGE_RETRIEVAL_EVENT;
    type = RETRY_IMAGE_RETRIEVAL_EVENT;

    constructor(
        public payload: ISelectRandomImagePayload,
        public timestamp?: string,
    ) {}
}
