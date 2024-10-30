const express = require('express');
const compression = require('compression');
const cors = require('cors');
const session = require('express-session');

// Import main application router
const appRouter = require('./komga-app/app');
const { getLocalIpAddress } = require('./utils');
const { SERVER_PORT, SESSION_SECRET, CACHE_DURATION } = require('./config');
const { KOMGA_ORIGIN } = require('./komga-app/config');

const app = express();
app.use(compression());

// Middleware
app.use(express.static('public'));
app.use(cors({
    origin: KOMGA_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    credentials: true,
}));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: CACHE_DURATION }
}));

// Apply routes
app.use(appRouter);

const PORT = SERVER_PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Making request from IP: ${getLocalIpAddress()}`);
});
