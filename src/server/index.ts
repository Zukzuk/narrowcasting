import express from 'express';
import compression from 'compression';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import { getPort, doServerLogging } from './utils.js';
import {
    USER_SESSION_SECRET,
    APP_CACHE_DURATION,
    APP_API_DOCS_PATH,
    APP_STATIC_SERVE_PATH,
    KOMGA_ORIGIN,
} from './config.js';

// server
const server = express();

// cors
server.use(cors({
    origin: KOMGA_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'X-Custom-Image-URL'],
    credentials: true,
}));

// session
server.use(session({
    secret: USER_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: APP_CACHE_DURATION },
}));

// compression
server.use(compression());

// static files serve
server.use(express.static(APP_STATIC_SERVE_PATH));

// api docs
import swaggerSpec from './swagger.js'; // Singleton instance
server.use(APP_API_DOCS_PATH, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// start server
server.listen(getPort(), async () => {
    // logging
    await doServerLogging();  
});

// orchestrate application
import orchestrator from './application/OrchestrateSingleton.js'; // Singleton instance
orchestrator.init(server);