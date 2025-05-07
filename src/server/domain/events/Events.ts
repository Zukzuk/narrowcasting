
import CrawlCompletedEvent from './CrawlCompletedEvent.js';
import CrawlFailedEvent from './CrawlFailedEvent.js';
import ImageRetrievedEvent from './ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from './ImageRetrievalFailedEvent.js';
import InvalidRandomListEvent from './InvalidRandomListEvent.js';
import RandomizedListCreatedEvent from './RandomizedListCreatedEvent.js';
import RandomizedListCreationFailedEvent from './RandomizedListCreationFailedEvent.js';
import RandomImageSelectedEvent from './RandomImageSelectedEvent.js';
import RandomImageSelectionFailedEvent from './RandomImageSelectionFailedEvent.js';
import RetryImageRetrievalEvent from './RetryImageRetrievalEvent.js';
import LibraryTraversedEvent from './LibraryTraversedEvent.js';
import LibraryTraversalFailedEvent from './LibraryTraversalFailedEvent.js';
export type TEvent =
    | CrawlCompletedEvent
    | CrawlFailedEvent
    | LibraryTraversedEvent
    | LibraryTraversalFailedEvent
    | ImageRetrievedEvent
    | RetryImageRetrievalEvent
    | ImageRetrievalFailedEvent
    | InvalidRandomListEvent
    | RandomImageSelectedEvent
    | RandomImageSelectionFailedEvent
    | RandomizedListCreatedEvent
    | RandomizedListCreationFailedEvent;
