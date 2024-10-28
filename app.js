const express = require('express');
const cors = require('cors');
const axios = require('axios');
const os = require('os');
const sharp = require('sharp');
const session = require('express-session');
require('dotenv').config();
// local
const crawlCollections = require('./crawl');

////////////////////////////////////

const app = express();
const PORT = process.env.PORT || 3000;
// Static files middleware
app.use(express.static('public'));
// Allow requests from https://me.daveloper.nl with credentials
const corsOptions = {
    origin: 'https://me.daveloper.nl', // replace with your actual domain
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    credentials: true, // allow cookies/auth tokens if needed
};
app.use(cors(corsOptions));
// Cache Settings
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hour
let totalSetCache = { value: null, expiration: 0 };
// Session middleware setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: CACHE_DURATION }
}));
// Komga API Configuration
const KOMGA_API = process.env.KOMGA_API_LOCATION;
const KOMGA_AUTH = {
    username: process.env.KOMGA_USERNAME2,
    password: process.env.KOMGA_PASSWORD2
};

////////////////////////////////////

// Function to get the primary network interface IP address
function getLocalIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        for (const addressInfo of networkInterface) {
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                return addressInfo.address;
            }
        }
    }
    return 'IP not found';
}

function getSetData(cache, fetch) {
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

async function initializeSet(req) {
    const totalSet = await getSetData(totalSetCache, fetchTotalSet);
    // [0, 1, 2, ..., totalSet - 1]
    req.session.remainingSet = Array.from({ length: totalSet }, (_, i) => i); 
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function getRandomUnusedInSet(req) {
    if (!req.session.remainingSet || req.session.remainingSet.length === 0) {
        // Initialize the set array
        await initializeSet(req);
    }
    const randomIndex = Math.floor(Math.random() * req.session.remainingSet.length);
    // Remove the chosen index from remainingSet
    return shuffleArray(req.session.remainingSet).splice(randomIndex, 1)[0]; 
}

async function parseImage(image) {
    const imageBuffer = Buffer.from(image.data, 'binary');
    const contentType = image.headers['content-type'];
    // Convert JP2 format to JPEG if needed
    if (contentType === 'image/jp2' || contentType === 'image/jpeg2000') {
        const convertedImageBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        return { image: convertedImageBuffer, contentType: 'image/jpeg' };
    }
    return { image: imageBuffer, contentType }
}

////////////////////////////////////s

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
        throw new Error(`Failed fetchTotalSet ${error}`);
    }
}

async function fetchRandomBookId(req) {
    const randomInSet = await getRandomUnusedInSet(req);
    console.log(`Picked index ${randomInSet} from set of length ${req.session.remainingSet.length}`)
    try {
        const response = await axios.get(`${KOMGA_API}/books`, {
            params: { page: randomInSet, size: 1 },
            auth: KOMGA_AUTH
        });
        const bookId = response.data.content[0]?.id;
        if (!bookId) throw new Error("No book ID found.");
        return bookId;
    } catch (error) {
        throw new Error(`Failed fetchRandomBookId ${error}`);
    }
}

async function fetchImage(bookId, page) {
    try {
        const response = await axios.get(`${KOMGA_API}/books/${bookId}/pages/${page}`, {
            params: { zero_based: true, contentNegotiation: true },
            responseType: 'arraybuffer',
            auth: KOMGA_AUTH
        });
        return await parseImage(response);
    } catch (error) {
        throw new Error(`Failed fetchImage ${error}`);
    }
}

async function getBookImage(req, page) {
    const bookId = await fetchRandomBookId(req);
    return await fetchImage(bookId, Number(page));
}

////////////////////////////////////

function handleError(error, res, message) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}

app.get('/book-images', async (req, res) => {
    const { page = 0 } = req.query;
    try {
        const { image, contentType } = await getBookImage(req, Number(page));
        if (!image || !contentType) {
            return res.status(500).json({ error: "No valid image or content type found" });
        }
        const base64Image = Buffer.from(image, 'binary').toString('base64');
        res.json({ image: base64Image, contentType });
    } catch (error) {
        handleError(error, res, "Error fetching random book image");
    }
});

////////////////////////////////////

// axios.interceptors.request.use(request => {
//     console.log('Starting Request', JSON.stringify(request, null, 2))
//     return request
// })
// axios.interceptors.response.use(response => {
//     console.log('Response:', JSON.stringify(response, null, 2))
//     return response
// })
// Start server
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    //TODO collections search
    //TODO debug short array for refetch
    //TODO input frontend for search params
    const localIp = getLocalIpAddress();
    console.log(`Making request from IP: ${localIp}`);
    const cachedCollections = await crawlCollections();
});
