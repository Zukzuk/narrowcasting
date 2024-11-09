const express = require('express');
const axios = require('axios');
const compression = require('compression');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const session = require('express-session');

// Import main application router
const router = require('./komga-app/router');
const { getLocalIpAddress } = require('./utils');
const { SESSION_SECRET, CACHE_DURATION } = require('./config');
const { KOMGA_ORIGIN } = require('./komga-app/config');

const app = express();
app.use(compression());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.use('/api', router);

axios.interceptors.request.use(request => {
    console.log('Call', request.url, request.params);
    return request;
});
// axios.interceptors.response.use(response => {
//     console.log('Response', response);
//     return response;
// })

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Local IP: ${getLocalIpAddress()}`);
});
