import express from 'express';
import { handleError, log } from '../../utils.js';
import ComicsCrawlReadModel from '../../interfaces/readmodels/ComicsCrawlReadModel.js';
import LibraryDirectoryTreeReadModel from '../../interfaces/readmodels/LibraryDirectoryTreeReadModel.js';
import TraverseLibraryCommand from '../../domain/core/commands/TraverseLibraryCommand.js';
import CrawlEndpointCommand from '../../domain/core/commands/CrawlEndpointCommand.js';

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
        console.warn("Request canceled:", error.message);
        return;
    }
    handleError(error, res, "Some error occurred");
}
*/

/**
 * This is the API for the Comics domain
 * 
 * @param {string} APP_SESSION_SECRET - The user session secret
 * @param {Object} models - The models object
 * @param {ComicsCrawlReadModel} models.comicsCrawlReadModel - The ComicsCrawlReadModel instance
 * @param {LibraryDirectoryTreeReadModel} models.LibraryDirectoryTreeReadModel - The LibraryDirectoryTreeReadModel instance
 * @returns {Object} - The router object
 */
export default function ComicsApi(
    APP_SESSION_SECRET: string,
    models: {
        comicsCrawlReadModel: ComicsCrawlReadModel,
        libraryDirectoryTreeReadModel: LibraryDirectoryTreeReadModel,
    }
) {
    const {
        comicsCrawlReadModel,
        libraryDirectoryTreeReadModel,
    } = models;

    /////////// COMMANDS /////////////

    /**
     * @openapi
     * /api/command/TraverseLibrary:
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
     *           default: "mounts/comics"
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
    router.post('/command/TraverseLibrary', async (req: any, res: any) => {
        const { startDir } = req.query;

        try {
            const payload = { userId: req.session.userId || APP_SESSION_SECRET, library: startDir };
            log('ComicsApi.post', 'publish', TraverseLibraryCommand.type);
            broker.pub(new TraverseLibraryCommand(payload));
            res.status(202).type('text').send('ok');
        } catch (error: any) {
            handleError(error, res, "Error publishing TraverseLibraryCommand");
        }
    });

    /**
     * @openapi
     * /api/command/CrawlEndpointCommand:
     *   post:
     *     tags: 
     *       - command
     *     summary: Command the crawling of a comics segment
     *     description: Commands the system to crawl a ssegment of the comics api
     *     parameters:
     *       - in: query
     *         name: endpoint
     *         schema:
     *           type: string
     *           default: "series"
     *         description: Start directory for crawling
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
    router.post('/command/CrawlEndpointCommand', async (req: any, res: any) => {
        const { endpoint } = req.query;

        try {
            const payload = { userId: req.session.userId || APP_SESSION_SECRET, endpoint };
            log('ComicsApi.post', 'publish', CrawlEndpointCommand.type);
            broker.pub(new CrawlEndpointCommand(payload));
            
            // broker.pub(new CrawlEndpointCommand({ userId: APP_SESSION_SECRET, endpoint: 'series' }));
            // broker.pub(new CrawlEndpointCommand({ userId: APP_SESSION_SECRET, endpoint: 'collections' }));
            
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
     *     summary: Request crawled series
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
            log('ComicsApi.get', 'query', 'series from comicsCrawlReadModel');
            const response = await comicsCrawlReadModel.query({ userId: req.session.userId || APP_SESSION_SECRET, endpoint: 'series', search });
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
     *     summary: Request crawled collections
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
            log('ComicsApi.get', 'query', 'collections from comicsCrawlReadModel');
            const response = await comicsCrawlReadModel.query({ userId: req.session.userId || APP_SESSION_SECRET, endpoint: 'collections', search });
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting crawled collections");
        }
    });

    /**
     * @openapi
     * /api/query/comics/dirtree:
     *   get:
     *     tags: 
     *       - query/comics
     *     summary: Request library directory tree
     *     description: Initiates a fetch of the comics directory tree
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
    router.get('/query/comics/dirtree', async (req: any, res: any) => {
        try {
            log('ComicsApi.get', 'query', 'directory tree from comicsDirectoryTreeReadModel');
            const response = await libraryDirectoryTreeReadModel.query({ userId: req.session.userId || APP_SESSION_SECRET });
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting comics directory tree");
        }
    });

    return router;
}
