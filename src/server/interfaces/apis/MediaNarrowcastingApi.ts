import express from 'express';
import { handleError } from '../../helpers.js';
import RandomImageCommand from '../../domain/generic/commands/RandomImageCommand.js';
import ImageReadModel from '../../interfaces/readmodels/ImageReadModel.js';

import broker from '../../infrastructure/broker/Broker.js';
const router = express.Router();

export default function MediaNarrowcastingApi(
    models: {
        imageReadModel: ImageReadModel,
    }
) {
    const {
        imageReadModel,
    } = models;

    /**
     * @openapi
     * /api/media/covers/random:
     *   post:
     *     tags: 
     *       - media-narrowcasting
     *     summary: Command the retrieval of a random media cover
     *     description: Commands the system to retrieve a random media cover from Plex
     *     parameters:
     *       - in: query
     *         name: interval
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Time interval for retrieving a random media cover
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
    router.post('/covers/random', async (req: any, res: any) => {
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
     * /api/media/images:
     *   get:
     *     tags: 
     *       - media-narrowcasting
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
            const response = await imageReadModel.query('movies');
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
