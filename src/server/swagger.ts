import swaggerJSDoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { APP_VERSION_TAG } from './config.js';
import path from 'path';
// __dirname emulation in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: "3.1.1",
        info: {
            title: "Narrowcasting API",
            version: APP_VERSION_TAG,
            description: "API documentation for narrowcasting service",
        },
    },
    apis: [
        `${__dirname}/bff/narrowcasting/apis/AppApi.js`,
        `${__dirname}/bff/narrowcasting/apis/ComicsApi.js`,
        `${__dirname}/bff/narrowcasting/apis/MediaApi.js`,
    ],
};

export default swaggerJSDoc(options); // Singleton instance
