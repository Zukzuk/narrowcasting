import { WithTimestamp } from "../annotations/index.js";   

export const CREATE_RANDOMIZED_LIST_COMMAND = 'CREATE_RANDOMIZED_LIST_COMMAND' as const;

export interface ICreateRandomizedListPayload {
    userId: string;
    page: number;
    interval: number;
    startTime: number;
}

@WithTimestamp
export default class CreateRandomizedListCommand {
    public static type = CREATE_RANDOMIZED_LIST_COMMAND;
    type = CREATE_RANDOMIZED_LIST_COMMAND;
    
    constructor(public payload: ICreateRandomizedListPayload) {}
}