export const mediaTypesPlex = [
    "audiobooks",
    "movies",
    "series",
    "animated-movies",
    "animated-series",
] as const;
export const mediaTypesKomga = [
    "comics",
] as const;
export const mediaTypesPlaynite = [
    "games",
] as const;
export const mediaTypes = [
    ...mediaTypesPlex,
    ...mediaTypesKomga,
    ...mediaTypesPlaynite,
] as const; // Combine as a readonly tuple
export type TMediaType = (typeof mediaTypes)[number]; // Union type of all media types

import CrawlCommand from '../commands/CrawlCommand.js';
import TraverseLibraryCommand from '../commands/TraverseLibraryCommand.js';
import SelectRandomImageCommand from '../commands/SelectRandomImageCommand.js';
import CreateRandomizedListCommand from '../commands/CreateRandomizedListCommand.js';
import RetrieveImageCommand from '../commands/RetrieveImageCommand.js';
export type TCommand =
    CrawlCommand |
    TraverseLibraryCommand |
    CreateRandomizedListCommand |
    SelectRandomImageCommand |
    RetrieveImageCommand;

import CrawlCompletedEvent from '../events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../events/CrawlFailedEvent.js';
import ImageRetrievedEvent from '../events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../events/ImageRetrievalFailedEvent.js';
import RandomImageSelectedEvent from '../events/RandomImageSelectedEvent.js';
import RandomImageSelectionFailedEvent from '../events/RandomImageSelectionFailedEvent.js';
import RetryImageRetrievalEvent from '../events/RetryImageRetrievalEvent.js';
import LibraryTraversedEvent from '../events/LibraryTraversedEvent.js';
import LibraryTraversalFailedEvent from '../events/LibraryTraversalFailedEvent.js';
export type TEvent =
    | CrawlCompletedEvent
    | CrawlFailedEvent
    | LibraryTraversedEvent
    | LibraryTraversalFailedEvent
    | ImageRetrievedEvent
    | RetryImageRetrievalEvent
    | ImageRetrievalFailedEvent
    | RandomImageSelectedEvent
    | RandomImageSelectionFailedEvent;

