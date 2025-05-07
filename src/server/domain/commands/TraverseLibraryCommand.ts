import { WithTimestamp } from "../annotations/index.js";   

export const TRAVERSE_LIBRARY_COMMAND = 'TRAVERSE_LIBRARY_COMMAND' as const;

export interface ITraverseLibraryPayload {
    userId: string;
    library: string 
}

@WithTimestamp
export default class TraverseLibraryCommand {
    public static type = TRAVERSE_LIBRARY_COMMAND;
    type = TRAVERSE_LIBRARY_COMMAND;
    
    constructor(public payload: ITraverseLibraryPayload) {}
}