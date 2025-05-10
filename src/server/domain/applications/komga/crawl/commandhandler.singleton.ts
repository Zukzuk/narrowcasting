import { log } from '../../../../utils.js';
import CrawlComicsCommand, { CRAWL_COMICS_COMMAND } from '../../../commands/CrawlComicsCommand.js';
import CrawlKomgaRepository from './repository.js';
import HandlerFailedEvent from '../../../events/HandlerFailedEvent.js';

import broker from '../../../../infrastructure/BrokerSingleton.js'; // Singleton instance

/**
 * Singleton class that handles the CrawlComicsCommand for Komga.
 * 
 * @class CrawlKomgaCommandhandlerSingleton
 */
class CrawlKomgaCommandhandlerSingleton {

    constructor(private repository: CrawlKomgaRepository) {}

    bootstrap() {
        log('CrawlKomgaCommandhandler.bootstrap()', 'subscribe', `${CRAWL_COMICS_COMMAND}`);
        broker.sub(CRAWL_COMICS_COMMAND, command => this.#handle(command));
    }

    /**
     * The handler orchestrates the domain process.
     * 
     * @param {CrawlComicsCommand} command The command to handle.
     */
    async #handle(command: CrawlComicsCommand) {
        try {
            // The repository is responsible for loading data (e.g., from a db / event store) 
            // and reconstituting the aggregateRoot, instantiating the DomainObject.
            let crawl = await this.repository.get(command);

            // Check if data is stale or invalid, and if so, crawl the comics (again).
            if (crawl.isEmpty() || crawl.isStale()) await crawl.execute(command);

            // Check for uncommitted data and write it to the repository, updating the aggregate.
            if (crawl.hasUncommittedData()) crawl = await this.repository.commit(command);

            // Grab the events raised by the aggregate.
            const events = crawl.getRaisedEvents();

            // Publish the events to the broker.
            for (const event of events) {
                log('CrawlKomgaCommandhandler.#handle()', 'publish', event.type);
                broker.pub(event);
            }
        } catch (error: any) {
            const event = new HandlerFailedEvent(error);
            log('CrawlKomgaCommandhandler.#handle()', 'publish', event.type);
            broker.pub(event);
            // Optionally rethrow or handle the error
        }
    }
}

export default new CrawlKomgaCommandhandlerSingleton(
    new CrawlKomgaRepository(),
); // Singleton instance through ES6 module caching