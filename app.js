const express = require('express');
const axios = require('axios');
const router = express.Router();
const { handleError, shuffleArray, parseImage } = require('./utils');
const { CACHE_DURATION, KOMGA_API, KOMGA_AUTH } = require('./config');

let totalSetCache = { value: null, expiration: 0 };

// Fetch image from Komga by book ID and page
async function fetchImage(bookId, page) {
    try {
        const response = await axios.get(`${KOMGA_API}/books/${bookId}/pages/${page}`, {
            params: { zero_based: true, contentNegotiation: true },
            responseType: 'arraybuffer',
            auth: KOMGA_AUTH
        });
        return await parseImage(response);
    } catch (error) {
        throw new Error(`Failed fetchImage: ${error}`);
    }
}

// Fetch total number of sets in Komga
async function fetchTotalSet() {
    try {
        const response = await axios.get(`${KOMGA_API}/books`, {
            params: { size: 1 },
            auth: KOMGA_AUTH
        });
        const totalSet = response.data.totalPages;
        if (!totalSet) throw new Error("No set found.");
        return totalSet;
    } catch (error) {
        throw new Error(`Failed fetchTotalSet: ${error}`);
    }
}

// General cache and/or fetch logic
async function retrieveSet(cache, fetch) {
    const currentTime = Date.now();
    if (cache.value !== null && currentTime < cache.expiration) {
        return Promise.resolve(cache.value);
    }
    return fetch().then(data => {
        cache.value = data;
        cache.expiration = currentTime + CACHE_DURATION;
        return data;
    });
}

// Retrieve a random unused index from session set
async function findRandomUnusedInSet(req) {
    if (!req.session.remainingSet || req.session.remainingSet.length === 0) {
        const totalSet = await retrieveSet(totalSetCache, fetchTotalSet);
        req.session.remainingSet = Array.from({ length: totalSet }, (_, i) => i);
    }
    const randomIndex = Math.floor(Math.random() * req.session.remainingSet.length);
    return shuffleArray(req.session.remainingSet).splice(randomIndex, 1)[0];
}

// Fetch a random book ID from Komga
async function fetchRandomBookId(req) {
    const randomInSet = await findRandomUnusedInSet(req);
    try {
        const response = await axios.get(`${KOMGA_API}/books`, {
            params: { page: randomInSet, size: 1 },
            auth: KOMGA_AUTH
        });
        const bookId = response.data.content[0]?.id;
        if (!bookId) throw new Error("No book ID found.");
        return bookId;
    } catch (error) {
        throw new Error(`Failed fetchRandomBookId: ${error}`);
    }
}

// Route for fetching a random book image
router.get('/book-images', async (req, res) => {
    const { page = 0 } = req.query;
    try {
        const bookId = await fetchRandomBookId(req);
        const { image, contentType } = await fetchImage(bookId, page);
        if (!image || !contentType) return res.status(500).json({ error: "No valid image or content type found" });
        res.json({ image: image, contentType });
    } catch (error) {
        handleError(error, res, "Error fetching random book image");
    }
});

module.exports = router;
