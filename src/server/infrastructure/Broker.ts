import { EventEmitter } from 'events';
import { TCommand, TEvent } from '../domain/types/index.js';
import { log } from '../utils.js';

type BrokerTypes = TCommand | TEvent;

/**
 * The broker is a simple event emitter that allows for the pub/sub pattern.
 * 
 * @class Broker
 */
class Broker extends EventEmitter {

    /**
     * Publish a command or event to the broker.
     * 
     * @param {BrokerTypes} unit - The command or event to publish.
     * @memberof Broker
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
     * @memberof Broker
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

export default new Broker(); // Singleton instance through ES6 module caching
