const axios = require('axios');
const express = require('express');
const router = express.Router();

const randomBook = require('./randomBook');
const crawl = require('./crawl');
const { handleError } = require('./utils');

// Route for fetching a random book image
router.get('/slideshow/random-book', async (req, res) => {
    const { page = 0 } = req.query;
    // Create a CancelToken source for this request
    const cancelToken = axios.CancelToken.source();
    req.on('close', () => {
        // Cancel the request if the client disconnects
        cancelToken.cancel("Client disconnected, request canceled.");
    });
    
    try {
        const { image, contentType } = await randomBook(req, page, cancelToken.token);
        if (!image) return res.status(500).json({ error: "No valid image or content type found" });
        res.set('Content-Type', contentType);
        res.send(image); // compression middleware will automatically gzip this if the client supports it
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log("Request canceled:", error.message);
            return; // End the response quietly if request was canceled
        }
        handleError(error, res, "Error fetching random book image");
    }
});

// Route for crawling
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
