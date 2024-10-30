const express = require('express');
const router = express.Router();
const randomBook = require('./randomBook');
const crawl = require('./crawl');
const { handleError } = require('./utils');

// Route for fetching a random book image
router.get('/slideshow/random-book', async (req, res) => {
    const { page = 0 } = req.query;
    try {
        const { image, contentType } = await randomBook(req, page);
        if (!image || !contentType) return res.status(500).json({ error: "No valid image or content type found" });
        res.json({ image: image, contentType });
    } catch (error) {
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
