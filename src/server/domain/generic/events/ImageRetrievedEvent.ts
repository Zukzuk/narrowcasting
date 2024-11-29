import { IMAGE_RETRIEVED_EVENT, ISuccessEvent } from "../../../domain/Event.js";
import { TDomain } from "../../../domain/generic/types/types.js";

export type TImageRetrievedPayload = {
    url: string;
    image: Buffer;
    contentType: string;
}

interface IImageRetrievedEventData {
    payload: TImageRetrievedPayload;
    domain: TDomain;
    timestamp?: string;
}

export default class ImageRetrievedEvent implements ISuccessEvent {
    public static type = IMAGE_RETRIEVED_EVENT;
    public get type() {
        return IMAGE_RETRIEVED_EVENT;
    }

    payload!: TImageRetrievedPayload;
    domain!: TDomain;
    timestamp?: string;

    constructor(data: IImageRetrievedEventData) {
        Object.assign(this, data);
    }
}
