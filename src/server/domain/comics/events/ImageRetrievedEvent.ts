import { IMAGE_RETRIEVED_EVENT, ISuccessEvent } from "../../../domain/Event.js";

export type IImageRetrievedPayload = {
    bookUrl: string;
    image: Buffer;
    contentType: string;
}

interface IImageRetrievedEventData {
    payload: IImageRetrievedPayload;
    domain: string;
    timestamp?: string;
}

export default class ImageRetrievedEvent implements ISuccessEvent {
    public static type = IMAGE_RETRIEVED_EVENT;
    public get type() {
        return IMAGE_RETRIEVED_EVENT;
    }

    payload!: IImageRetrievedPayload;
    domain!: string;
    timestamp?: string;

    constructor(data: IImageRetrievedEventData) {
        Object.assign(this, data);
    }
}
