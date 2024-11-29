import CrawlCompletedEvent from '../domain/comics/events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../domain/comics/events/CrawlFailedEvent.js';
import ImageRetrievedEvent from '../domain/shared/events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../domain/shared/events/ImageRetrievalFailedEvent.js';

export type TEvent =
    | CrawlCompletedEvent
    | CrawlFailedEvent
    | ImageRetrievedEvent
    | ImageRetrievalFailedEvent;
