import CrawlEndpointCommand from './CrawlEndpointCommand.js';
import TraverseLibraryCommand from './TraverseLibraryCommand.js';
import SelectRandomImageCommand from './SelectRandomImageCommand.js';
import CreateRandomizedListCommand from './CreateRandomizedListCommand.js';
import RetrieveImageCommand from './RetrieveImageCommand.js';
export type TCommand =
    | CrawlEndpointCommand
    | TraverseLibraryCommand
    | CreateRandomizedListCommand
    | SelectRandomImageCommand
    | RetrieveImageCommand;