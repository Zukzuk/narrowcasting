import express from 'express';
import { handleError } from '../../utils.js';
import ComicsCrawlReadModel from '../../interfaces/readmodels/ComicsCrawlReadModel.js';

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

export default function ComicsApi(
    models: {
        comicsCrawlReadModel: ComicsCrawlReadModel,
    }
) {
    const {
        comicsCrawlReadModel,
    } = models;

    /**
     * @openapi
     * /api/query/comics/series:
     *   get:
     *     tags: 
     *       - query
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
    router.get('/query/comics/series', async (req: any, res: any) => {
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
     * /api/query/comics/collections:
     *   get:
     *     tags: 
     *       - query
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
    router.get('/query/comics/collections', async (req: any, res: any) => {
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
