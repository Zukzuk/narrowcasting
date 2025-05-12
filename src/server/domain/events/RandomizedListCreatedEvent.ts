import { WithTimestamp } from "../annotations/index.js";
import { IWeightedCache } from "../applications/narrowcasting/ImageIndexRepository.js";
import { ISelectRandomImagePayload } from "../commands/SelectRandomImageCommand.js";

export const RANDOMIZED_LIST_CREATED_EVENT = 'RANDOMIZED_LIST_CREATED_EVENT' as const;

@WithTimestamp
export default class RandomizedListCreatedEvent {
    public static type = RANDOMIZED_LIST_CREATED_EVENT;
    type = RANDOMIZED_LIST_CREATED_EVENT;

    constructor(
        public payload: ISelectRandomImagePayload,
        public weightedList: IWeightedCache[],
        public timestamp?: string
    ) {}
}
