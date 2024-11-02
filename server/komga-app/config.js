require('dotenv').config();
const path = require('path');

const KOMGA_ORIGIN = process.env.KOMGA_ORIGIN;
const KOMGA_API = KOMGA_ORIGIN+process.env.KOMGA_API_PATH;
const KOMGA_AUTH = {
    username: process.env.KOMGA_USERNAME2,
    password: process.env.KOMGA_PASSWORD2
};
const CRAWL_PAGE_SIZE = 50;
const TEMP_DIR = '/tmp';
const INPUT_FILE = path.join(TEMP_DIR, 'input.jp2');
const OUTPUT_FILE = path.join(TEMP_DIR, 'output.png');

module.exports = {
    KOMGA_ORIGIN,
    KOMGA_API,
    KOMGA_AUTH,
    CRAWL_PAGE_SIZE,
    INPUT_FILE,
    OUTPUT_FILE,
};
