import { Timestamped } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const IMAGE_RETRIEVED_EVENT = 'IMAGE_RETRIEVED_EVENT' as const;

export type TImageRetrievedPayload = {
    url: string;
    image: Buffer;
    contentType: string;
};

@Timestamped
export default class ImageRetrievedEvent {
    public static type = IMAGE_RETRIEVED_EVENT;
    type = IMAGE_RETRIEVED_EVENT;

    constructor(
        public payload: TImageRetrievedPayload,
        public mediaType: TMediaType,
        public timestamp?: string,
    ) {}
}
