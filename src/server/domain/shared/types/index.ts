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
export const mediaTypes = [
    ...mediaTypesPlex,
    ...mediaTypesKomga,
] as const; // Combine as a readonly tuple
export type TMediaType = (typeof mediaTypes)[number]; // Union type of all media types

import CrawlCommand from '../commands/CrawlCommand.js';
import RandomImageCommand from '../commands/SelectRandomImageCommand.js';
import RetrieveImageCommand from '../commands/RetrieveImageCommand.js';
export type TCommand =
    CrawlCommand |
    RandomImageCommand |
    RetrieveImageCommand;

import CrawlCompletedEvent from '../events/CrawlCompletedEvent.js';
import CrawlFailedEvent from '../events/CrawlFailedEvent.js';
import ImageRetrievedEvent from '../events/ImageRetrievedEvent.js';
import ImageRetrievalFailedEvent from '../events/ImageRetrievalFailedEvent.js';
import RandomImageSelectedEvent from '../events/RandomImageSelectedEvent.js';
import RandomImageSelectionFailedEvent from '../events/RandomImageSelectionFailedEvent.js';
export type TEvent =
    | CrawlCompletedEvent
    | CrawlFailedEvent
    | ImageRetrievedEvent
    | ImageRetrievalFailedEvent
    | RandomImageSelectedEvent
    | RandomImageSelectionFailedEvent;

