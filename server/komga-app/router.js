const axios = require('axios');
const express = require('express');
const router = express.Router();

const randomBook = require('./randomBook');
const crawl = require('./crawl');
const { handleError } = require('./utils');

/**
 * @openapi
 * /api/slideshow/random-book:
 *   get:
 *     summary: Get a random book image
 *     description: Fetches a random book image from the database
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Page number for pagination
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
router.get('/slideshow/random-book', async (req, res) => {
    const { page = 0 } = req.query;
    const cancelToken = axios.CancelToken.source();
    req.on('close', () => {
        cancelToken.cancel("Client disconnected, request canceled.");
    });
    
    try {
        const { image, contentType } = await randomBook(req, page, cancelToken.token);
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
 * /api/crawl:
 *   get:
 *     summary: Perform a crawling operation
 *     description: Initiates a crawling operation to fetch data from the target source
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
router.get('/crawl', async (req, res) => {
    try {
        const crawled = await crawl();
        if (!crawled) return res.status(500).json({ error: "No valid content found" });
        res.json(crawled);
    } catch (error) {
        handleError(error, res, "Error crawling komga");
    }
});

module.exports = router;
