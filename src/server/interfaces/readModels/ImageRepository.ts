import ImageRetrievedEvent from "server/domain/comics/events/ImageRetrievedEvent.js";

import broker from "../../infrastructure/broker/Broker.js";

export default class ImageReadModel {
    private cache: Record<string, any>;

    constructor() {
        this.cache = {};
        // subscribe to events
        broker.sub(ImageRetrievedEvent.type, event => this.#denormalize(event));
    }

    #denormalize(event: ImageRetrievedEvent) {
        console.log('ImageReadModel:', event.type, event.domain);
        // denormalize
        this.cache[event.domain] = event.payload;
    }

    query() {
        return this.cache;
    }
}
/**
 *
        const cancelToken = axios.CancelToken.source();
        req.on('close', () => {
            cancelToken.cancel("Client disconnected, request canceled.");
        });

        try {
            const { image, contentType, bookId } = await randomBook(req, page, interval, cancelToken.token);
            if (!image) return res.status(500).json({ error: "No valid image or content type found" });
            res.set('X-Custom-Book-URL', `${KOMGA_ORIGIN}/book/${bookId}`);
            res.set('Content-Type', contentType);
            res.send(image);         
        } catch (error: any) {
            if (axios.isCancel(error)) {
                console.log("Request canceled:", error.message);
                return;
            }
            handleError(error, res, "Error publishing RandomImageCommand");
        }
 */
