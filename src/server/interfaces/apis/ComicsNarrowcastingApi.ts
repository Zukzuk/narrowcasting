import express from 'express';
import { handleError } from '../../helpers.js';
import RandomImageCommand from '../../domain/comics/commands/RandomImageCommand.js';

import broker from '../../infrastructure/broker/Broker.js';

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
     *     summary: Command to retrieve a random comic image
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
     *         description: Returns the image of a random comic
     *         content:
     *           image/jpeg:
     *             schema:
     *               type: string
     *               format: binary
     *       500:
     *         description: Internal Server Error or no valid image found
     */
    router.post('/pages/random', async (req: any, res: any) => {
        const { 
            page = 0, 
            interval = 10 
        }: { 
            page: number, 
            interval: number
        } = req.query;
        
        try {
            broker.pub(new RandomImageCommand({ 
                payload: { 
                    page, 
                    interval, 
                    session: req.session
                }, 
                timestamp: new Date().toISOString() })
            );
            res.status(202).type('text').send('ok');
        } catch (error: any) {
            handleError(error, res, "Error publishing RandomImageCommand");
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
            const response = await komgaCrawlReadModel.query({endpoint: 'series', search});
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
            const response = await komgaCrawlReadModel.query({endpoint: 'collections', search});
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting crawled collections");
        }
    });

    return router;
}
