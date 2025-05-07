import { WithTimestamp } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const IMAGE_RETRIEVED_EVENT = 'IMAGE_RETRIEVED_EVENT' as const;

export interface IImageRetrievedPayload {
    userId: string;
    mediaType: TMediaType;
    url: string;
    image: Buffer;
    contentType: string;
};

@WithTimestamp
export default class ImageRetrievedEvent {
    public static type = IMAGE_RETRIEVED_EVENT;
    type = IMAGE_RETRIEVED_EVENT;

    constructor(
        public payload: IImageRetrievedPayload,
        public timestamp?: string,
    ) {}
}
