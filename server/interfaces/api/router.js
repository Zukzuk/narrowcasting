const axios = require('axios');
const express = require('express');
const router = express.Router();

const randomBook = require('../../deprecated/randomBook');
const { handleError } = require('../../deprecated/utils');

function createRouter(models) {
    const {
        commandHandler, 
        crawlReadModel, 
        errorReadModel, 
        versionReadModel
    } = models;

    /**
     * @openapi
     * /api/books/random:
     *   get:
     *     summary: Get a random book image
     *     description: Fetches a random book image from the database
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
     *         description: Time interval for retrieving a random book image
     *     responses:
     *       200:
     *         description: Returns the image of a random book
     *         content:
     *           image/jpeg:
     *             schema:
     *               type: string
     *               format: binary
     *       500:
     *         description: Internal Server Error or no valid image found
     */
    router.get('/books/random', async (req, res) => {
        const { page = 0, interval = 10 } = req.query;
        const cancelToken = axios.CancelToken.source();
        req.on('close', () => {
            cancelToken.cancel("Client disconnected, request canceled.");
        });
        try {
            const { image, contentType } = await randomBook(req, page, interval, cancelToken.token);
            if (!image) return res.status(500).json({ error: "No valid image or content type found" });
            res.set('Content-Type', contentType);
            res.send(image);
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log("Request canceled:", error.message);
                return;
            }
            handleError(error, res, "Error fetching random book image");
        }
    });

    /**
     * @openapi
     * /api/series:
     *   get:
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
    router.get('/series', async (req, res) => {
        const { search } = req.query;
        try {
            const response = await crawlReadModel.query({endpoint: 'series', search});
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error) {
            handleError(error, res, "Error crawling series");
        }
    });

    /**
     * @openapi
     * /api/collections:
     *   get:
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
    router.get('/collections', async (req, res) => {
        const { search } = req.query;
        try {
            const response = await crawlReadModel.query({endpoint: 'collections', search});
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error) {
            handleError(error, res, "Error crawling collections");
        }
    });

    /**
     * @openapi
     * /api/version:
     *   get:
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
    router.get('/version', async (req, res) => {
        try {
            const response = await versionReadModel.query();
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.type('text').send(response); // Send as plain text
        } catch (error) {
            handleError(error, res, "Error requesting version");
        }
    });

    return router;
}

module.exports = createRouter;
