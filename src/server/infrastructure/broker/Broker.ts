import { EventEmitter } from 'events';
import { TCommand } from '../../domain/Command.js';
import { TEvent } from '../..domain/Event.js';

type CommandsAndEvents = TCommand | TEvent;

class Broker extends EventEmitter {
    /**
     * Publish a command or event.
     *
     * @param unit - The command or event to publish.
     */
    pub(unit: CommandsAndEvents) {
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
    sub<K extends CommandsAndEvents['type']>(
        type: K,
        listener: (unit: Extract<CommandsAndEvents, { type: K }>) => void
    ) {
        console.log('Broker: sub ->', type);
        this.on(type, listener);
    }
}

export default new Broker(); // Singleton instance through ES6 module caching
