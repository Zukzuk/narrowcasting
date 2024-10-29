require('dotenv').config();

const SERVER_PORT = process.env.PORT;
const SESSION_SECRET = process.env.SESSION_SECRET;

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

const KOMGA_ORIGIN = process.env.KOMGA_ORIGIN;
const KOMGA_API = KOMGA_ORIGIN+process.env.KOMGA_API_LOCATION;
const KOMGA_AUTH = {
    username: process.env.KOMGA_USERNAME2,
    password: process.env.KOMGA_PASSWORD2
};

const CRAWL_PAGE_SIZE = 50;

module.exports = {
    SERVER_PORT,
    SESSION_SECRET,
    CACHE_DURATION,
    KOMGA_ORIGIN,
    KOMGA_API,
    KOMGA_AUTH,
    CRAWL_PAGE_SIZE
};
