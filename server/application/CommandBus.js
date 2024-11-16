class CommandBus {
    constructor() {
      this.handlers = new Map(); // Mapping of command types to handlers
    }
  
    register(commandType, handler) {
      this.handlers.set(commandType, handler);
    }
  
    emit(command) {
      const handler = this.handlers.get(command.type);
      if (!handler) {
        throw new Error(`No handler found for command type: ${command.type}`);
      }
      return handler.handle(command);
    }
  }
  
  module.exports = new CommandBus();
  