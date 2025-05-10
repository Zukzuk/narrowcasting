import { WithTimestamp } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const IMAGE_RETRIEVAL_FAILED_EVENT = 'IMAGE_RETRIEVAL_FAILED_EVENT' as const;

@WithTimestamp
export default class ImageRetrievalFailedEvent {
    public static type = IMAGE_RETRIEVAL_FAILED_EVENT;
    type = IMAGE_RETRIEVAL_FAILED_EVENT;

    constructor(
        public error: any,
        public mediaType: TMediaType,
        public url?: string,
        public timestamp?: string,
    ) { }
}
