import CrawlCommand from '../domain/comics/commands/CrawlCommand.js';
import RandomImageCommand from '../domain/shared/commands/RandomImageCommand.js';

export type TCommand = CrawlCommand | RandomImageCommand;
