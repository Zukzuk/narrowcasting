import { log } from '../../../../utils.js';
import { mediaTypesKomga } from '../../../types/index.js';
import RetrieveImageCommand, { RETRIEVE_IMAGE_COMMAND } from '../../../commands/RetrieveImageCommand.js';
import RetrieveImageKomgaRepository from './repository.js';
import HandlerFailedEvent from '../../../events/HandlerFailedEvent.js';

import broker from '../../../../infrastructure/BrokerSingleton.js'; // Singleton instance

/**
 * Singleton class that handles the RetrieveImageCommand for Komga.
 * 
 * @class RetrieveImageKomgaCommandhandlerSingleton
 */
class RetrieveImageKomgaCommandhandlerSingleton {

    constructor(private repository: RetrieveImageKomgaRepository) { }

    bootstrap() {
        log('RetrieveImageKomgaCommandhandler.bootstrap()', 'subscribe', `${RETRIEVE_IMAGE_COMMAND}`);
        broker.sub(RETRIEVE_IMAGE_COMMAND, command => { 
            const { mediaType } = command.payload;
            if (mediaTypesKomga.some(type => type === mediaType)) this.#handle(command)
        });
    }

    /**
     * The handler orchestrates the domain process.
     * 
     * @param {RetrieveImageCommand} command The command to handle.
     */
    async #handle(command: RetrieveImageCommand) {
        try {
            // The repository is responsible for loading data (e.g., from a db / event store) 
            // and reconstituting the aggregateRoot, instantiating the DomainObject.
            let retrieveImage = await this.repository.get(command);

            // Check if data is stale or invalid, and if so, retrieve a new image.
            await retrieveImage.execute(command);

            // Check for uncommitted data and write it to the repository, updating the aggregate.
            if (retrieveImage.hasUncommittedData())  retrieveImage = await this.repository.commit(command);

            // Grab the events raised by the aggregate.
            const events = retrieveImage.getRaisedEvents();

            // Publish the events to the broker.
            for (const event of events) {
                log('RetrieveImageKomgaCommandhandler.#handle()', 'publish', event.type);
                broker.pub(event);
            }
        } catch (error: any) {
            const event = new HandlerFailedEvent(error);
            log('RetrieveImageKomgaCommandhandler.#handle()', 'publish', event.type);
            broker.pub(event);
            // Optionally rethrow or handle the error
        }
    }
}

export default new RetrieveImageKomgaCommandhandlerSingleton(
    new RetrieveImageKomgaRepository(),
); // Singleton instance through ES6 module caching