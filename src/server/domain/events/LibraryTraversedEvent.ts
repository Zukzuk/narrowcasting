import { WithTimestamp } from "../annotations/index.js";
import { DirectoryNode } from "../applications/services/TraverseDirectoryService.js";

export const LIBRARY_TRAVERSED_EVENT = 'LIBRARY_TRAVERSED_EVENT' as const;

@WithTimestamp
export default class LibraryTraversedEvent {
    public static type = LIBRARY_TRAVERSED_EVENT;
    type = LIBRARY_TRAVERSED_EVENT;

    constructor(
        public payload: DirectoryNode,
        public timestamp?: string,
    ) {}
}
