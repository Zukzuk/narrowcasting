import { AxiosBasicCredentials } from 'axios';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();
// constants
const APP_CRAWL_PAGE_SIZE: number = 200;
const APP_CACHE_DURATION: number = 12 * 60 * 60 * 1000; // 12 hours
// dynamic environment variables
const APP_VERSION_TAG: string = process.env.APP_VERSION_TAG as string;
// environment variables
const APP_SESSION_SECRET: string = process.env.APP_SESSION_SECRET as string;
const APP_API_PATH: string = process.env.APP_API_PATH as string;
const APP_STATIC_SERVE_PATH: string = process.env.APP_STATIC_SERVE_PATH as string;
const APP_API_DOCS_PATH: string = process.env.APP_API_DOCS_PATH as string;
// target environment variables
const KOMGA_NARROWCASTING_API_PATH: string = process.env.KOMGA_NARROWCASTING_API_PATH as string;
const KOMGA_ORIGIN: string = process.env.KOMGA_ORIGIN as string;
const KOMGA_API: string = KOMGA_ORIGIN+process.env.KOMGA_API_PATH as string;
const KOMGA_AUTH: AxiosBasicCredentials = {
    username: process.env.KOMGA_USERNAME as string,
    password: process.env.KOMGA_PASSWORD as string
};

export {
    APP_CRAWL_PAGE_SIZE,
    APP_CACHE_DURATION,
    APP_SESSION_SECRET,
    APP_STATIC_SERVE_PATH,
    APP_VERSION_TAG,
    APP_API_PATH,
    APP_API_DOCS_PATH,
    KOMGA_NARROWCASTING_API_PATH,
    KOMGA_ORIGIN,
    KOMGA_API,
    KOMGA_AUTH,
};
