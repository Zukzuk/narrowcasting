import { EventEmitter } from 'events';
import { TCommand } from '../../domain/Command.js';
import { TEvent } from '../../domain/Event.js';

type BrokerTypes = TCommand | TEvent;

class Broker extends EventEmitter {
    /**
     * Publish a command or event.
     *
     * @param unit - The command or event to publish.
     */
    pub(unit: BrokerTypes) {
        if (unit) {
            console.log('Broker: pub ->', unit.type);
            super.emit(unit.type, unit);
        }
    }

    /**
     * Subscribe to a command or event type.
     *
     * @param type - The type of the command or event to listen for.
     * @param listener - The function to handle the command or event.
     */
    sub<K extends BrokerTypes['type']>(
        type: K,
        listener: (unit: Extract<BrokerTypes, { type: K }>) => void
    ) {
        console.log('Broker: sub ->', type);
        this.on(type, listener);
    }
}

export default new Broker(); // Singleton instance through ES6 module caching
