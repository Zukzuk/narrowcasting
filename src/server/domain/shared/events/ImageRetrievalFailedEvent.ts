import { Timestamped } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const IMAGE_RETRIEVAL_FAILED_EVENT = 'IMAGE_RETRIEVAL_FAILED_EVENT' as const;

@Timestamped
export default class ImageRetrievalFailedEvent {
    public static type = IMAGE_RETRIEVAL_FAILED_EVENT;
    type = IMAGE_RETRIEVAL_FAILED_EVENT;

    constructor(
        public error: any,
        public url: string,
        public mediaType: TMediaType,
        public timestamp?: string,
    ) {}
}
