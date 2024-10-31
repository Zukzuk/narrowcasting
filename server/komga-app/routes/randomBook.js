const axios = require('axios');
const sharp = require('sharp');

const { shuffleArray } = require('../utils');
const { KOMGA_API, KOMGA_AUTH } = require('../config');
const { CACHE_DURATION } = require('../../config');

let totalSetCache = { value: null, expiration: 0 };

// Fetch image by book ID and page
async function fetchImage(bookId, page, interval, cancelToken, startTime, retryCount) {
    console.log('fetchImage', bookId, page, 'Attempt:', retryCount);
    try {
        const image = await axios.get(`${KOMGA_API}/books/${bookId}/pages/${page}`, {
            params: { zero_based: true, contentNegotiation: true },
            responseType: 'arraybuffer',
            auth: KOMGA_AUTH,
            cancelToken,
        });

        const contentType = image.headers['content-type'];
        if (contentType === 'image/jp2' || contentType === 'image/jpeg2000')
            throw new Error("Unsupported image format");

        // Use sharp to resize and optimize the image for 4K
        const optimizedImage = await sharp(image.data)
            .resize({ width: 3840, height: 2160, fit: 'inside' })
            .toFormat('webp', { quality: 80 })
            .toBuffer();

        return { image: optimizedImage, contentType: 'image/webp' };
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log("Previous fetchImage request canceled:", error.message);
            return null;
        } else if (error.message === "Unsupported image format") {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = interval - elapsedTime;
            if (remainingTime > 5000) {
                console.log(`Retry attempt ${retryCount} with ${remainingTime}ms remaining`);
                // Retry fetching the image, increasing retry count
                return fetchImage(bookId, page, cancelToken, timeout, startTime, retryCount + 1);
            } else {
                console.log(`No retry attempt because remaining time in interval (${remainingTime}ms) is too short...`);
            }
        }
        throw new Error(`Failed to fetch image: ${error.message}`);
    }
}

// Fetch a random book ID
async function fetchBookId(randomInSet, cancelToken) {
    console.log('fetchBookId');
    try {
        const response = await axios.get(`${KOMGA_API}/books`, {
            params: { page: randomInSet, size: 1 },
            auth: KOMGA_AUTH,
            cancelToken,
        });
        const bookId = response.data.content[0]?.id;
        if (!bookId) throw new Error("No book ID found.");
        return bookId;
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log("Previous fetchBookId request canceled:", error.message);
            return null;
        }
        throw new Error(`Failed fetchBookId: ${error}`);
    }
}

// Fetch total number of sets
async function fetchTotalSet() {
    console.log('fetchTotalSet');
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
async function retrieveTotalSet(cache, fetch) {
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
        const totalSet = await retrieveTotalSet(totalSetCache, fetchTotalSet);
        req.session.remainingSet = Array.from({ length: totalSet }, (_, i) => i);
    }
    const randomIndex = Math.floor(Math.random() * req.session.remainingSet.length);
    return shuffleArray(req.session.remainingSet).splice(randomIndex, 1)[0];
}

async function randomBook(req, page, interval, cancelToken, startTime = Date.now(), retryCount = 1) {
    const randomInSet = await findRandomUnusedInSet(req);
    const bookId = await fetchBookId(randomInSet, cancelToken);
    return await fetchImage(bookId, page, interval, cancelToken, startTime, retryCount);
}

module.exports = randomBook;