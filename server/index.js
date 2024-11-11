const express = require('express');
const axios = require('axios');
const compression = require('compression');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const session = require('express-session');
// application imports
const Orchestrator = require('./application/Orchestrator');
const { 
    port, 
    localIpAddress, 
    hostName, 
    // gatewayAddress,
} = require('./utils');
const { 
    SESSION_SECRET, 
    CACHE_DURATION, 
    KOMGA_ORIGIN, 
    NARROWCASTING_API_PATH,
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
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// application orchestration
const orchestrator = new Orchestrator();
orchestrator.useApi(server, NARROWCASTING_API_PATH);

// axios logging
axios.interceptors.request.use(request => {
    console.log('Call', request.url, request.params ? request.params : '');
    return request;
});
// axios.interceptors.response.use(response => {
//     console.log('Response', response);
//     return response;
// })

// start server
server.listen(port(), async () => {
    console.log(`Server is running on http://${localIpAddress()}:${port()}`);
    // console.log(`Hostname is '${hostName()} and gatewayAddress is '${gatewayAddress()}'`);
});
