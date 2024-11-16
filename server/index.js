const express = require('express');
const compression = require('compression');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const session = require('express-session');
// application imports
const swaggerSpec = require('./swagger');
const AppBFF = require('./application/AppBFF');
const KomgaBFF = require('./application/KomgaBFF');
const { 
    port, 
    localIpAddress, 
    // hostName, 
    // gatewayAddress,
    axiosLogging,
} = require('./utils');
const { 
    SESSION_SECRET, 
    CACHE_DURATION, 
    KOMGA_ORIGIN, 
    APP_API_PATH,
    KOMGA_NARROWCASTING_API_PATH,
    API_DOCS_PATH,
} = require('./config');

// initialize
const server = express();
// middleware
server.use(cors({
    origin: KOMGA_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    credentials: true,
}));
server.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: CACHE_DURATION },
}));
server.use(compression());
server.use(express.static('public'));
server.use(API_DOCS_PATH, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// logging
axiosLogging(true, false);
// start server
server.listen(port(), async () => {
    console.log(`Server is running on http://${localIpAddress()}:${port()}`);
    // console.log(`Hostname is '${hostName()} and gatewayAddress is '${gatewayAddress()}'`);
});

// application orchestration
const appBFF = new AppBFF();
appBFF.bootstrap(server, APP_API_PATH);
const komgaBFF = new KomgaBFF();
komgaBFF.bootstrap(server, KOMGA_NARROWCASTING_API_PATH);
