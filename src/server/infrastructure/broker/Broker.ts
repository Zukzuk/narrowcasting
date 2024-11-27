import { EventEmitter } from 'events';

class Broker extends EventEmitter {
    /**
     * Emit an command/event.
     *
     * @param unit - An event or command.
     */
    pub(unit: any) {
        super.emit(unit.type, unit);
    }

    /**
     * Subscribe to an command/event.
     *
     * @param type - The type of the command/event to listen for.
     * @param listener - The function to handle the command/event.
     */
    sub(type: string, listener: (unit: any) => void) {
        this.on(type, listener);
    }
}

export default new Broker(); // Singleton instance through ES6 module caching
