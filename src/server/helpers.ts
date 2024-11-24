export function handleError(error: any, res: any, message: string) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}

export class UrlError extends Error {
    url: string;

    constructor(message: string, url: string) {
        super(message);
        this.url = url;
        Object.setPrototypeOf(this, UrlError.prototype); // Required for extending built-in classes
    }
}