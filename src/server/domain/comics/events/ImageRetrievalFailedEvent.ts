import { IMAGE_RETRIEVAL_FAILED_EVENT, IFailedEvent } from "../../../domain/Event.js";

interface IImageRetrievalFailedEventData {
    url: string;
    error: any;
    domain: string;
    timestamp?: string;
}

export default class ImageRetrievalFailedEvent implements IFailedEvent {
    public static type = IMAGE_RETRIEVAL_FAILED_EVENT;
    public get type() {
        return IMAGE_RETRIEVAL_FAILED_EVENT;
    }

    url!: string;
    error!: any;
    domain!: string;
    timestamp?: string;

    constructor(data: IImageRetrievalFailedEventData) {
        Object.assign(this, data);
    }
}
