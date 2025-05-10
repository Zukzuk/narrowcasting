import { AxiosBasicCredentials } from 'axios';
import dotenv from 'dotenv';

// load environment variables from the .env file
dotenv.config();

// constants
export const APP_PORT: number = Number(process.env.APP_PORT) as number;
export const APP_SHOW_LOGGING: boolean = process.env.APP_SHOW_LOGGING === 'true';
export const APP_CRAWL_PAGE_SIZE: number = 200;
export const APP_CACHE_DURATION: number = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
export const APP_VERSION_TAG: string = process.env.APP_VERSION_TAG as string;
// environment variables
export const APP_SESSION_SECRET: string = process.env.APP_SESSION_SECRET as string;
export const USER_SESSION_SECRET: string = process.env.USER_SESSION_SECRET as string;
export const APP_STATIC_SERVE_PATH: string = process.env.APP_STATIC_SERVE_PATH as string;
export const APP_API_PATH: string = process.env.APP_API_PATH as string;
export const APP_API_DOCS_PATH: string = process.env.APP_API_DOCS_PATH as string;
export const APP_DOCS_PATH: string = process.env.APP_DOCS_PATH as string;
// target environment variables
export const KOMGA_ORIGIN: string = process.env.KOMGA_ORIGIN as string;
export const KOMGA_API: string = KOMGA_ORIGIN+process.env.KOMGA_API_PATH as string;
export const KOMGA_AUTH: AxiosBasicCredentials = {
    username: process.env.KOMGA_USERNAME as string,
    password: process.env.KOMGA_PASSWORD as string
} as AxiosBasicCredentials;
export const KOMGA_TAVERSAL_ORIGIN: string = process.env.KOMGA_TAVERSAL_ORIGIN as string;
export const PLEX_ORIGIN: string = process.env.PLEX_ORIGIN as string;
export const PLEX_API: string = PLEX_ORIGIN+process.env.PLEX_API_PATH as string;
export const PLEX_API_KEY: string = process.env.PLEX_API_KEY as string;
export const PLEX_MACHINE_IDENTIFIER: string = process.env.PLEX_MACHINE_IDENTIFIER as string;
export const PLAYNITE_BACKUP_ORIGIN: string = process.env.PLAYNITE_BACKUP_ORIGIN as string;
export const PLAYNITE_BACKUP_IMAGE_FOLDER: string = process.env.PLAYNITE_BACKUP_IMAGE_FOLDER as string;