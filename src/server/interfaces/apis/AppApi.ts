import express from 'express';
import { handleError, log } from '../../utils.js';
import SelectRandomImageCommand from '../../domain/core/commands/SelectRandomImageCommand.js';
import VersionReadModel from '../../interfaces/readmodels/VersionReadModel.js';
import ErrorReadModel from '../../interfaces/readmodels/ErrorReadModel.js';
import ImageReadModel from '../../interfaces/readmodels/ImageReadModel.js';

import broker from '../../infrastructure/broker/Broker.js';
const router = express.Router();

/**
 * This is the main API for the application.
 * 
 * @param {string} USER_SESSION_SECRET - The user session secret
 * @param {string} APP_SESSION_SECRET - The user session secret
 * @param {Object} models - The models object
 * @param {VersionReadModel} models.versionReadModel - The VersionReadModel instance
 * @param {ErrorReadModel} models.errorReadModel - The ErrorReadModel instance
 * @param {ImageReadModel} models.imageReadModel - The ImageReadModel instance
 * @returns {Object} - The router object
 */
export default function AppApi(
    USER_SESSION_SECRET: string,
    APP_SESSION_SECRET: string,
    models: {
        versionReadModel: VersionReadModel,
        errorReadModel: ErrorReadModel,
        imageReadModel: ImageReadModel,
    }
) {
    const {
        versionReadModel,
        errorReadModel,
        imageReadModel,
    } = models;

    /////////// COMMANDS /////////////

    /**
     * @openapi
     * /api/command/SelectRandomImage:
     *   post:
     *     tags: 
     *       - command
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
    router.post('/command/SelectRandomImage', async (req: any, res: any) => {
        const { page = 0, interval = 10000 }: { page: number, interval: number } = req.query;

        try {
            const payload = { userId: req.session.userId || APP_SESSION_SECRET, page, interval, startTime: Date.now() };
            log('AppApi.post', 'publish', SelectRandomImageCommand.type);
            broker.pub(new SelectRandomImageCommand(payload));
            res.status(202).type('text').send('ok');
        } catch (error: any) {
            handleError(error, res, "Error publishing SelectRandomImageCommand");
        }
    });

    /////////// QUERIES /////////////

    /**
     * @openapi
     * /api/query/login:
     *   get:
     *     tags: 
     *       - query
     *     summary: Dummy login
     *     description: ...
     *     responses:
     *       200:
     *        description: Dummy login success
     *        headers:
     *         Set-Cookie:
     *         description: >
     *             Session cookie (if using express-session or similar).  
     *             For example: `connect.sid=...; Path=/; HttpOnly`.
     *         schema:
     *             type: string
     *         content:
     *             application/json:
     *             schema:
     *                 type: object
     *                 properties:
     *                 message:
     *                     type: string
     *                     description: A simple status message.
     *                 userId:
     *                     type: string
     *                     description: The generated/assigned dummy user ID.
     *                 required:
     *                 - message
     *                 - userId
     *       500:
     *         description: Internal server error
     */
    router.get('/query/login', (req, res) => {

        // TODO: Should add authorization to the app
        
        // Once a user has authenticated/identified themselves,
        // we assign a userId to their session:
        req.session.userId = USER_SESSION_SECRET;
        res.send(`Dummy session userId provided: ${req.session.userId}`);
    });

    /**
     * @openapi
     * /api/query/version:
     *   get:
     *     tags: 
     *       - query
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
    router.get('/query/version', async (req: any, res: any) => {
        try {
            log('AppApi.get', 'query', 'versionReadModel');
            const response = await versionReadModel.query();
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.type('text').send(response); // Send as plain text
        } catch (error: any) {
            handleError(error, res, "Error requesting version");
        }
    });

    /**
     * @openapi
     * /api/query/errors:
     *   get:
     *     tags: 
     *       - query
     *     summary: Get the application's errors
     *     description: Returns all currently aggregated errors of the application as plain text.
     *     responses:
     *       200:
     *         description: Successfully retrieved errors
     *         content:
     *           text/plain:
     *             schema:
     *               type: string
     *               example: "[...errors]"
     *               description: List of errors of the application
     *       500:
     *         description: Internal server error
     */
    router.get('/query/errors', async (req: any, res: any) => {
        try {
            log('AppApi.get', 'query', 'errorReadModel');
            const response = await errorReadModel.query();
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.type('text').send(JSON.stringify(response, null, 2)); // Send as plain text
        } catch (error: any) {
            handleError(error, res, "Error requesting errors");
        }
    });

    /**
     * @openapi
     * /api/query/library/images:
     *   get:
     *     tags: 
     *       - query/library
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
    router.get('/query/library/images', async (req: any, res: any) => {
        try {
            log('AppApi.get', 'query', 'latest from imageReadModel');
            const response = await imageReadModel.query({ userId: req.session.userId || APP_SESSION_SECRET, mediaType: 'latest' });
            if (!response) return res.status(500).json({ error: "No valid content dfsdfsdf" });
            res.set('X-Custom-Image-URL', response.url);
            res.set('Content-Type', response.contentType);
            res.send(response.image);

        } catch (error: any) {
            handleError(error, res, "Error requesting image");
        }
    });

    return router;
}
