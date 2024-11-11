const swaggerJSDoc = require('swagger-jsdoc');
const { VERSION_TAG } = require('./config');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Comics Narrowcasting API",
            version: VERSION_TAG,
            description: "API documentation for the narrowcasting service",
        },
    },
    apis: [`${__dirname}/interfaces/api/router.js`],
};

module.exports = swaggerJSDoc(options);
