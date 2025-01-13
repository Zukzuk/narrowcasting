import { Timestamped } from "../annotations/index.js";

export const LIBRARY_TRAVERSAL_FAILED_EVENT = 'LIBRARY_TRAVERSAL_FAILED_EVENT' as const;

@Timestamped
export default class LibraryTraversalFailedEvent {
    public static type = LIBRARY_TRAVERSAL_FAILED_EVENT;
    type = LIBRARY_TRAVERSAL_FAILED_EVENT;

    constructor(
        public error: any,
        public url: string,
        public timestamp?: string,
    ) {}
}
