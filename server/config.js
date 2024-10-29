require('dotenv').config();

const SERVER_PORT = process.env.PORT;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

module.exports = {
    SERVER_PORT,
    SESSION_SECRET,
    CACHE_DURATION,
};
