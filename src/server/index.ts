import express from 'express';
import compression from 'compression';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
// application imports
import swaggerSpec from './swagger.js';
import AppBFF from './application/AppBFF.js';
import KomgaBFF from './application/KomgaBFF.js';
import { 
    getLocalIpAddress,
    getHostName,
    getGatewayAddress,
    getPort,
    doAxiosLogging,
} from './utils.js';
import { 
    APP_SESSION_SECRET, 
    APP_CACHE_DURATION, 
    APP_API_DOCS_PATH,
    APP_STATIC_SERVE_PATH,
    APP_API_PATH,
    KOMGA_ORIGIN, 
    KOMGA_NARROWCASTING_API_PATH,
} from './config.js';

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
    secret: APP_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: APP_CACHE_DURATION },
}));
server.use(compression());
server.use(express.static(APP_STATIC_SERVE_PATH));
server.use(APP_API_DOCS_PATH, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// logging
doAxiosLogging(true, false);
// start server
server.listen(getPort(), async () => {
    console.log(
        `Server is running`,
        `LocalIpAddress=${getLocalIpAddress()}`,
        `InternaPort=${getPort()}`,
        `gatewayAddress='${await getGatewayAddress()}'`,
        `Hostname='${getHostName()}`,
    );
});

// TODO: Refactor to TS

// application orchestration
const appBFF = new AppBFF();
appBFF.bootstrap(server, APP_API_PATH);
const komgaBFF = new KomgaBFF();
// TODO: Refactor Komga randomBook to use CQRS
komgaBFF.bootstrap(server, KOMGA_NARROWCASTING_API_PATH);
// TODO: Add Plex BFF
