import axios from 'axios';
import express from 'express';
import randomBook from '../../deprecated/randomBook.js';
import { handleError } from '../../helpers.js';
import { KOMGA_ORIGIN } from '../../config.js';

const router = express.Router();

export default function ComicsNarrowcastingApi(models: any) {
    const {
        komgaCrawlReadModel,
    } = models;

    /**
     * @openapi
     * /api/comics/pages/random:
     *   get:
     *     tags: 
     *       - comics-narrowcasting
     *     summary: Get a random comic image
     *     description: Fetches a random comic image from the database
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
     *         description: Returns the image of a random comic
     *         content:
     *           image/jpeg:
     *             schema:
     *               type: string
     *               format: binary
     *       500:
     *         description: Internal Server Error or no valid image found
     */
    router.get('/pages/random', async (req: any, res: any) => {
        const { page = 0, interval = 10 } = req.query;
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
            handleError(error, res, "Error fetching random comic image");
        }
    });

    /**
     * @openapi
     * /api/comics/series:
     *   get:
     *     tags: 
     *       - comics-narrowcasting
     *     summary: Crawl series
     *     description: Initiates a crawling operation to fetch series data
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term
     *     responses:
     *       200:
     *         description: Successfully crawled data
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
            const response = await komgaCrawlReadModel.query({endpoint: 'series', search});
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error crawling series");
        }
    });

    /**
     * @openapi
     * /api/comics/collections:
     *   get:
     *     tags: 
     *       - comics-narrowcasting
     *     summary: Crawl collections
     *     description: Initiates a crawling operation to fetch collections data
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term
     *     responses:
     *       200:
     *         description: Successfully crawled data
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
            const response = await komgaCrawlReadModel.query({endpoint: 'collections', search});
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error crawling collections");
        }
    });

    return router;
}
