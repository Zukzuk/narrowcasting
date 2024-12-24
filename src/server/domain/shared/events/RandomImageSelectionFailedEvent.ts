import { Timestamped } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const RANDOM_IMAGE_SELECTION_FAILED_EVENT = 'RANDOM_IMAGE_SELECTION_FAILED_EVENT' as const;

@Timestamped
export default class RandomImageSelectionFailedEvent {
    public static type = RANDOM_IMAGE_SELECTION_FAILED_EVENT;
    type = RANDOM_IMAGE_SELECTION_FAILED_EVENT;

    constructor(
        public error: any,
        public url: string,
        public mediaType?: TMediaType,
        public timestamp?: string,
    ) {}
}
