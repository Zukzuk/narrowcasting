/**
 * Decorator to add a timestamp to a class
 */
export function WithTimestamp<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        timestamp = new Date().toISOString();
    };
}

/**
 * Decorator to add a userId to a class
 */
export function WithUserId<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        userId = new Date().toISOString();
    };
}