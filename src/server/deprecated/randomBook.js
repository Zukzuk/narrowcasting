import axios from 'axios';
import sharp from 'sharp';

import { shuffleArray } from './utils.js';
import { APP_CACHE_DURATION, KOMGA_API, KOMGA_AUTH } from '../config.js';

let totalSetCache = { value: null, expiration: 0 };

// Fetch image by book ID and page
async function fetchImage(req, bookId, page, interval, cancelToken, startTime, retryCount) {
    console.log('fetchImage attempt', retryCount);
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
        return { image: optimizedImage, contentType: 'image/webp', bookId };
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
                return randomBook(req, page, interval, cancelToken, startTime, retryCount + 1)
            } else {
                console.log(`No retry attempt because remaining time in interval (${remainingTime}ms) is too short...`);
            }
        }
        throw new Error(`Failed to fetch image: ${error.message}`);
    }
}

// Fetch a random book ID
async function fetchBookId(randomIndex, cancelToken) {
    console.log('fetchBookId');
    try {
        const response = await axios.get(`${KOMGA_API}/books`, {
            params: { page: randomIndex, size: 1 },
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
async function fetchIndexTotal() {
    console.log('fetchIndexTotal');
    try {
        const response = await axios.get(`${KOMGA_API}/books`, {
            params: { size: 1 },
            auth: KOMGA_AUTH
        });
        const totalSet = response.data.totalPages;
        if (!totalSet) throw new Error("No set found.");
        return totalSet;
    } catch (error) {
        throw new Error(`Failed fetchIndexTotal: ${error}`);
    }
}

// General cache and/or fetch logic
async function retrieveIndexTotal(cache, fetch) {
    const currentTime = Date.now();
    if (cache.value !== null && currentTime < cache.expiration) {
        return Promise.resolve(cache.value);
    }
    return fetch().then(data => {
        cache.value = data;
        cache.expiration = currentTime + APP_CACHE_DURATION;
        return data;
    });
}

// Retrieve a random unused index from session set
async function retrieveRandomIndex(req) {
    if (!req.session.remainingSet || req.session.remainingSet.length === 0) {
        const totalSet = await retrieveIndexTotal(totalSetCache, fetchIndexTotal);
        req.session.remainingSet = Array.from({ length: totalSet }, (_, i) => i);
    }
    const randomIndex = Math.floor(Math.random() * req.session.remainingSet.length);
    return shuffleArray(req.session.remainingSet).splice(randomIndex, 1)[0];
}

async function randomBook(req, page, interval, cancelToken, startTime = Date.now(), retryCount = 1) {
    const randomIndex = await retrieveRandomIndex(req);
    const bookId = await fetchBookId(randomIndex, cancelToken);
    return await fetchImage(req, bookId, page, interval, cancelToken, startTime, retryCount);
}

export default randomBook;