import { EventEmitter } from 'events';

class Broker extends EventEmitter {
    /**
     * Emit an event or command.
     *
     * @param unit - An event or command.
     */
    pub(unit: any) {
        super.emit(unit.type, unit);
    }

    /**
     * Subscribe to an event or command.
     *
     * @param type - The type of the event or command to listen for.
     * @param listener - The function to handle the event or command.
     */
    sub(type: string, listener: (unit: any) => void) {
        this.on(type, listener);
    }
}

export default new Broker(); // Singleton instance
