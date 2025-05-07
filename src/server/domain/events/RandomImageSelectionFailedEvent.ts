import { WithTimestamp } from "../annotations/index.js";

export const RANDOM_IMAGE_SELECTION_FAILED_EVENT = 'RANDOM_IMAGE_SELECTION_FAILED_EVENT' as const;

@WithTimestamp
export default class RandomizedImageSelectionFailedEvent {
    public static type = RANDOM_IMAGE_SELECTION_FAILED_EVENT;
    type = RANDOM_IMAGE_SELECTION_FAILED_EVENT;

    constructor(
        public error: any,
        public url: string,
        public timestamp?: string,
    ) {}
}
