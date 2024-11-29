import { Timestamped } from "../../../domain/Annotations.js";
import { TDomain } from "../../../domain/shared/types/types.js";

export const IMAGE_RETRIEVAL_FAILED_EVENT = 'IMAGE_RETRIEVAL_FAILED_EVENT' as const;

@Timestamped
export default class ImageRetrievalFailedEvent {
    public static type = IMAGE_RETRIEVAL_FAILED_EVENT;
    type = IMAGE_RETRIEVAL_FAILED_EVENT;

    constructor(
        public url: string,
        public error: any,
        public domain: TDomain,
        public timestamp?: string // Added by @Timestamped
    ) {}
}
