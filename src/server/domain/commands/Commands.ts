import CrawlComicsCommand from './CrawlComicsCommand.js';
import TraverseLibraryCommand from './TraverseLibraryCommand.js';
import SelectRandomImageCommand from './SelectRandomImageCommand.js';
import CreateRandomizedListCommand from './CreateRandomizedListCommand.js';
import RetrieveImageCommand from './RetrieveImageCommand.js';
export type TCommand =
    | CrawlComicsCommand
    | TraverseLibraryCommand
    | CreateRandomizedListCommand
    | SelectRandomImageCommand
    | RetrieveImageCommand;