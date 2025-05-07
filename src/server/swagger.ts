import swaggerJSDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { APP_VERSION_TAG } from './config.js';
import path from 'path';

// Get the file path of the current module
const __filename = fileURLToPath(import.meta.url);
// Get the directory of the current module
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Narrowcasting API",
            version: APP_VERSION_TAG,
            description: "API documentation for narrowcasting service",
        },
    },
    apis: [
        `${__dirname}/interfaces/apis/AppApi.js`,
        `${__dirname}/interfaces/apis/ComicsApi.js`,
        `${__dirname}/interfaces/apis/MediaApi.js`,
    ],
};

export default swaggerJSDoc(options); // Singleton instance
