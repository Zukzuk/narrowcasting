import express from 'express';
import { handleError } from '../../helpers.js';
import RandomImageCommand from '../../domain/shared/commands/RandomImageCommand.js';
import VersionReadModel from '../../interfaces/readmodels/VersionReadModel.js';
import ImageReadModel from '../../interfaces/readmodels/ImageReadModel.js';

import broker from '../../infrastructure/broker/Broker.js';
const router = express.Router();

export default function AppApi(
    models: {
        versionReadModel: VersionReadModel,
        imageReadModel: ImageReadModel,
    }
) {
    const {
        versionReadModel,
        imageReadModel,
    } = models;

    /**
     * @openapi
     * /api/version:
     *   get:
     *     tags: 
     *       - application
     *     summary: Get the application version
     *     description: Returns the current semantic version of the application as plain text.
     *     responses:
     *       200:
     *         description: Successfully retrieved version
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: "1.2.3"
     *               description: Semantic version of the application
     *       500:
     *         description: Internal server error
     */
    router.get('/version', async (req: any, res: any) => {
        try {
            const response = await versionReadModel.query();
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.type('text').send(response); // Send as plain text
        } catch (error: any) {
            handleError(error, res, "Error requesting version");
        }
    });

    /**
     * @openapi
     * /api/images/random:
     *   post:
     *     tags: 
     *       - application
     *     summary: Command the retrieval of a random image
     *     description: Commands the system to retrieve a random image from Komga
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
     *         description: Time interval for retrieving a random image
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
    router.post('/images/random', async (req: any, res: any) => {
        const {
            page = 0,
            interval = 10000
        }: {
            page: number,
            interval: number
        } = req.query;

        try {
            broker.pub(new RandomImageCommand({ page, interval }));
            res.status(202).type('text').send('ok');
        } catch (error: any) {
            handleError(error, res, "Error publishing RandomImageCommand");
        }
    });

    /**
     * @openapi
     * /api/images:
     *   get:
     *     tags: 
     *       - application
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
            const response = await imageReadModel.query();
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.set('X-Custom-Image-URL', response.url);
            res.set('Content-Type', response.contentType);
            res.send(response.image);

        } catch (error: any) {
            handleError(error, res, "Error requesting image");
        }
    });

    return router;
}
