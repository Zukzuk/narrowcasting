import { WithTimestamp } from "../annotations/index.js";
import { TMediaType } from "../types/index.js";

export const RANDOM_IMAGE_SELECTED_EVENT = 'RANDOM_IMAGE_SELECTED_EVENT' as const;

export interface IRandomImageSelectedPayload {
    userId: string;
    index: number;
    mediaType: TMediaType; 
    page: number;
    interval: number; 
    startTime: number; 
}

@WithTimestamp
export default class RandomImageSelectedEvent {
    public static type = RANDOM_IMAGE_SELECTED_EVENT;
    type = RANDOM_IMAGE_SELECTED_EVENT;

    constructor(
        public payload: IRandomImageSelectedPayload,
        public timestamp?: string
    ) {}
}
