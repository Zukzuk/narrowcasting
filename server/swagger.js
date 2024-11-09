const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Book Slideshow API",
            version: process.env.VERSION_TAG,
            description: "API documentation for the book slideshow service",
        },
    },
    apis: [`${__dirname}/komga-app/router.js`],
};

module.exports = swaggerJSDoc(options);
