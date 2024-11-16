require('dotenv').config();

const SESSION_SECRET = process.env.SESSION_SECRET;
const VERSION_TAG = process.env.VERSION_TAG;
const APP_API_PATH = process.env.APP_API_PATH;
const KOMGA_NARROWCASTING_API_PATH = process.env.KOMGA_NARROWCASTING_API_PATH;
const API_DOCS_PATH = process.env.API_DOCS_PATH;
const KOMGA_ORIGIN = process.env.KOMGA_ORIGIN;
const KOMGA_API = KOMGA_ORIGIN+process.env.KOMGA_API_PATH;
const KOMGA_AUTH = {
    username: process.env.KOMGA_USERNAME2,
    password: process.env.KOMGA_PASSWORD2
};

const CRAWL_PAGE_SIZE = 200;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

module.exports = {
    SESSION_SECRET,
    CACHE_DURATION,
    VERSION_TAG,
    APP_API_PATH,
    KOMGA_NARROWCASTING_API_PATH,
    API_DOCS_PATH,
    KOMGA_ORIGIN,
    KOMGA_API,
    KOMGA_AUTH,
    CRAWL_PAGE_SIZE,
};
