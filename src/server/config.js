import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();
// constants
const APP_CRAWL_PAGE_SIZE = 200;
const APP_CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
// dynamic environment variables
const APP_VERSION_TAG = process.env.APP_VERSION_TAG;
// environment variables
const APP_SESSION_SECRET = process.env.APP_SESSION_SECRET;
const APP_API_PATH = process.env.APP_API_PATH;
const APP_STATIC_SERVE_PATH = process.env.APP_STATIC_SERVE_PATH;
const APP_API_DOCS_PATH = process.env.APP_API_DOCS_PATH;
// target environment variables
const KOMGA_NARROWCASTING_API_PATH = process.env.KOMGA_NARROWCASTING_API_PATH;
const KOMGA_ORIGIN = process.env.KOMGA_ORIGIN;
const KOMGA_API = KOMGA_ORIGIN+process.env.KOMGA_API_PATH;
const KOMGA_AUTH = {
    username: process.env.KOMGA_USERNAME,
    password: process.env.KOMGA_PASSWORD
};

export {
    APP_CRAWL_PAGE_SIZE,
    APP_CACHE_DURATION,
    APP_SESSION_SECRET,
    APP_STATIC_SERVE_PATH,
    APP_VERSION_TAG,
    APP_API_PATH,
    APP_API_DOCS_PATH,
    KOMGA_NARROWCASTING_API_PATH,
    KOMGA_ORIGIN,
    KOMGA_API,
    KOMGA_AUTH,
};
