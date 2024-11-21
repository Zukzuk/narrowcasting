class EventBus {
    constructor() {
      this.listeners = new Map(); // Mapping of event types to listener arrays
    }
  
    register(eventType, listener) {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, []);
      }
      this.listeners.get(eventType).push(listener);
    }
  
    emit(event) {
      const listeners = this.listeners.get(event.type) || [];
      listeners.forEach(listener => listener.handle(event));
    }
  }
  
export default new EventBus();
  