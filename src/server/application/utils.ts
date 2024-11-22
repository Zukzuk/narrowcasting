export default class UrlError extends Error {
    url: string;

    constructor(message: string, url: string) {
        super(message);
        this.url = url;
        Object.setPrototypeOf(this, UrlError.prototype); // Required for extending built-in classes
    }
}