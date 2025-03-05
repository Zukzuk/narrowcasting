import { WithTimestamp } from "../annotations/index.js";

export const RANDOMIZED_LIST_CREATION_FAILED_EVENT = 'RANDOMIZED_LIST_CREATION_FAILED_EVENT' as const;

@WithTimestamp
export default class RandomizedListCreationFailedEvent {
    public static type = RANDOMIZED_LIST_CREATION_FAILED_EVENT;
    type = RANDOMIZED_LIST_CREATION_FAILED_EVENT;

    constructor(
        public error: any,
        public url: string,
        public timestamp?: string,
    ) {}
}
