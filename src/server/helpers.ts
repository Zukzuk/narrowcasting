export function handleError(error: any, res: any, message: string) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}

export class UrlError extends Error {
    url: string;

    constructor(message: string, url: string) {
        super(message);
        this.url = url;
        Object.setPrototypeOf(this, UrlError.prototype);
    }
}

export class RetryError extends Error {
    retry: boolean;
    url: string;

    constructor(message: string, url: string) {
        super(message);
        this.retry = true;
        this.url = url;
        Object.setPrototypeOf(this, RetryError.prototype);
    }
}