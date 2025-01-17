/**
 * Decorator to add a timestamp to a class
 */
export function Timestamped<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        timestamp = new Date().toISOString();
    };
}