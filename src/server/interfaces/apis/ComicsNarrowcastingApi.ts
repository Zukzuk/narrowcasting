import express from 'express';
import { handleError } from '../../helpers.js';
import RandomImageCommand from '../../domain/generic/commands/RandomImageCommand.js';
import ComicsCrawlReadModel from '../../interfaces/readmodels/ComicsCrawlReadModel.js';
import ImageReadModel from '../../interfaces/readmodels/ImageReadModel.js';

import broker from '../../infrastructure/broker/Broker.js';
const router = express.Router();

/**
const cancelToken = axios.CancelToken.source();
req.on('close', () => {
    cancelToken.cancel("Client disconnected, request canceled.");
});
try {
    // do something  
} catch (error: any) {
    if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return;
    }
    handleError(error, res, "Some error occurred");
}
*/

export default function ComicsNarrowcastingApi(
    models: {
        comicsCrawlReadModel: ComicsCrawlReadModel,
        imageReadModel: ImageReadModel,
    }
) {
    const {
        comicsCrawlReadModel,
        imageReadModel,
    } = models;

    /**
     * @openapi
     * /api/comics/pages/random:
     *   post:
     *     tags: 
     *       - comics-narrowcasting
     *     summary: Command the retrieval of a random comic image
     *     description: Commands the system to retrieve a random comic image from Komga
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 0
     *         description: Page number of selected page
     *       - in: query
     *         name: interval
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Time interval for retrieving a random comic image
     *     responses:
     *       200:
     *         description: Command accepted
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: "ok"
     *               description: Command accepted
     *       500:
     *         description: Internal Server Error or no valid image found
     */
    router.post('/pages/random', async (req: any, res: any) => {
        const {
            page = 0,
            interval = 10000
        }: {
            page: number,
            interval: number
        } = req.query;

        try {
            broker.pub(new RandomImageCommand({
                payload: { page, interval },
                timestamp: new Date().toISOString()
            }));
            res.status(202).type('text').send('ok');
        } catch (error: any) {
            handleError(error, res, "Error publishing RandomImageCommand");
        }
    });

    /**
     * @openapi
     * /api/comics/images:
     *   get:
     *     tags: 
     *       - comics-narrowcasting
     *     summary: Fetch last retrieved image
     *     description: Initiates fetch of last retrieved image data
     *     responses:
     *       200:
     *         description: Successfully fetched image
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       500:
     *         description: Internal Server Error or no valid content found
     */
    router.get('/images', async (req: any, res: any) => {
        try {
            const response = await imageReadModel.query('comics');
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.set('X-Custom-Image-URL', response.url);
            res.set('Content-Type', response.contentType);
            res.send(response.image);

        } catch (error: any) {
            handleError(error, res, "Error requesting image");
        }
    });

    /**
     * @openapi
     * /api/comics/series:
     *   get:
     *     tags: 
     *       - comics-narrowcasting
     *     summary: Crawl series
     *     description: Initiates fetch of series data
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term
     *     responses:
     *       200:
     *         description: Successfully fetched data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       500:
     *         description: Internal Server Error or no valid content found
     */
    router.get('/series', async (req: any, res: any) => {
        const { search } = req.query;
        try {
            const response = await comicsCrawlReadModel.query({ endpoint: 'series', search });
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting crawled series");
        }
    });

    /**
     * @openapi
     * /api/comics/collections:
     *   get:
     *     tags: 
     *       - comics-narrowcasting
     *     summary: Crawl collections
     *     description: Initiates a fetch of collections data
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term
     *     responses:
     *       200:
     *         description: Successfully fetched data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       500:
     *         description: Internal Server Error or no valid content found
     */
    router.get('/collections', async (req: any, res: any) => {
        const { search } = req.query;
        try {
            const response = await comicsCrawlReadModel.query({ endpoint: 'collections', search });
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting crawled collections");
        }
    });

    return router;
}
