import { EventEmitter } from 'events';
import { TCommand } from '../domain/commands/Commands.js';
import { TEvent } from '../domain/events/Events.js';
import { log } from '../utils.js';

type BrokerTypes = TCommand | TEvent;

/**
 * The broker is a simple event emitter that allows for the pub/sub pattern.
 * 
 * @class BrokerSingleton
 */
class BrokerSingleton extends EventEmitter {

    /**
     * Publish a command or event to the broker.
     * 
     * @param {BrokerTypes} unit - The command or event to publish.
     * @memberof BrokerSingleton
     */
    pub(unit: BrokerTypes) {
        if (unit) {
            // log('Broker', 'emit', unit.type);
            super.emit(unit.type, unit);
        }
    }

    /**
     * Subscribe to a command or event type.
     * 
     * @param {K | K[]} type - The type of command or event to subscribe to.
     * @param {(unit: Extract<BrokerTypes, { type: K }>) => void} listener - The callback function to execute when the command or event is published.
     * @memberof BrokerSingleton
     */
    sub<K extends BrokerTypes['type']>(
        type: K | K[],
        listener: (unit: Extract<BrokerTypes, { type: K }>) => void
    ) {
        if (!Array.isArray(type)) type = [type];
        type.forEach(t => {
            // log('Broker', 'subscribe', t);
            this.on(t, listener);
        });
    }
}

export default new BrokerSingleton(); // Singleton instance through ES6 module caching
