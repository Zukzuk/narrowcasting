import { EventEmitter } from 'events';
import { TCommand, TEvent } from '../../domain/shared/types/index.js';
import { log } from '../../utils.js';

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
     * @param unit - The command or event to publish.
     * @memberof Broker
     */
    pub(unit: BrokerTypes) {
        if (unit) {
            super.emit(unit.type, unit);
            // log('Broker', 'emit', unit.type);
        }
    }

    /**
     * Subscribe to a command or event type.
     * 
     * @param type - The type of command or event to subscribe to.
     * @param listener - The callback function to execute when the command or event is published.
     * @memberof Broker
     */
    sub<K extends BrokerTypes['type']>(
        type: K | K[],
        listener: (unit: Extract<BrokerTypes, { type: K }>) => void
    ) {
        if (!Array.isArray(type)) type = [type];
        type.forEach(t => {
            this.on(t, listener);
            // log('Broker', 'subscribe', t);
        });
    }
}

export default new Broker(); // Singleton instance through ES6 module caching
