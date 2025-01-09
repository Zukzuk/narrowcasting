import { EventEmitter } from 'events';
import { TCommand, TEvent } from '../../domain/shared/types/index.js';

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
            console.log('Broker:: logging: publish ->', unit.type);
            super.emit(unit.type, unit);
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
        type: K,
        listener: (unit: Extract<BrokerTypes, { type: K }>) => void
    ) {
        console.log('Broker:: logging: subscribe ->', type);
        this.on(type, listener);
    }
}

export default new Broker(); // Singleton instance through ES6 module caching
