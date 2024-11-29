import { EventEmitter } from 'events';
import { ICommand } from '../../domain/Command.js';
import { IFailedEvent, ISuccessEvent } from '../../domain/Event.js';

class Broker extends EventEmitter {
    /**
     * Emit an command/event.
     *
     * @param unit - An command/event.
     */
    pub(unit: any) {
        if (unit) {
            console.log('Broker: pub ->', unit.type);
            super.emit(unit.type, unit);
            }
    }

    /**
     * Subscribe to an command/event.
     *
     * @param type - The type of the command/event to listen for.
     * @param listener - The function to handle the command/event.
     */
    sub(type: string, listener: (unit: any) => void) {
        console.log('Broker: sub ->', type);
        this.on(type, listener);
    }
}

export default new Broker(); // Singleton instance through ES6 module caching
