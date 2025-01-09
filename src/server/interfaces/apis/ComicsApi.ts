import express from 'express';
import { handleError } from '../../utils.js';
import ComicsCrawlReadModel from '../../interfaces/readmodels/ComicsCrawlReadModel.js';
import TraverseLibraryCommand from '../../domain/shared/commands/TraverseLibraryCommand.js';

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

/**
 * This is the API for the Comics domain
 * 
 * @param {Object} models - The models object
 * @param {ComicsCrawlReadModel} models.comicsCrawlReadModel - The ComicsCrawlReadModel instance
 * @returns {Object} - The router object
 */
export default function ComicsApi(
    models: {
        comicsCrawlReadModel: ComicsCrawlReadModel,
    }
) {
    const {
        comicsCrawlReadModel,
    } = models;

    /////////// COMMANDS /////////////

    /**
     * @openapi
     * /api/command/TraverseLibraryCommand:
     *   post:
     *     tags: 
     *       - command
     *     summary: Command the traversal of a directory
     *     description: Commands the system to traverse a library directory
     *     parameters:
     *       - in: query
     *         name: startDir
     *         schema:
     *           type: string
     *           default: "/mounts/comics"
     *         description: Start directory for traversing
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
    router.post('/command/TraverseLibraryCommand', async (req: any, res: any) => {
        const { startDir } = req.query;

        try {
            broker.pub(new TraverseLibraryCommand({ userId: req.session.userId, library: startDir }));
            res.status(202).type('text').send('ok');
        } catch (error: any) {
            handleError(error, res, "Error publishing TraverseLibraryCommand");
        }
    });

    /////////// QUERIES /////////////

    /**
     * @openapi
     * /api/query/comics/series:
     *   get:
     *     tags: 
     *       - query/comics
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
            const response = await comicsCrawlReadModel.query({ userId: req.session.userId, endpoint: 'series', search });
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
     *       - query/comics
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
            const response = await comicsCrawlReadModel.query({ userId: req.session.userId, endpoint: 'collections', search });
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting crawled collections");
        }
    });

    return router;
}
