import CrawlCommand from './comics/commands/CrawlCommand.js';
import RandomImageCommand from './shared/commands/RandomImageCommand.js';

export type TCommand = CrawlCommand | RandomImageCommand;
