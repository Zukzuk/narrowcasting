require('dotenv').config();

const KOMGA_ORIGIN = process.env.KOMGA_ORIGIN;
const KOMGA_API = KOMGA_ORIGIN+process.env.KOMGA_API_PATH;
const KOMGA_AUTH = {
    username: process.env.KOMGA_USERNAME2,
    password: process.env.KOMGA_PASSWORD2
};
const CRAWL_PAGE_SIZE = 50;

module.exports = {
    KOMGA_ORIGIN,
    KOMGA_API,
    KOMGA_AUTH,
    CRAWL_PAGE_SIZE,
};
