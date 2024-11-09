require('dotenv').config();

const SESSION_SECRET = process.env.SESSION_SECRET;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const VERSION_TAG = process.env.VERSION_TAG;

module.exports = {
    SESSION_SECRET,
    CACHE_DURATION,
    VERSION_TAG,
};
