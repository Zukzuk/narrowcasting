import os from 'os';
import defaultGateway from 'default-gateway';
import axios from 'axios';
import { APP_PORT, APP_SHOW_LOGGING } from './config.js';

function getLocalIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        if (networkInterface) {
            for (const addressInfo of networkInterface) {
                if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                    return addressInfo.address;
                }
            }
        }
    }
    return 'NoIP';
}

function getHostName() {
    return os.hostname();
}

async function getGatewayAddress() {
    try {
        const result = await defaultGateway.gateway4sync()
        return result.gateway;
    } catch (err) {
        console.error('Error getting gateway address:', err);
        return 'Gateway not found';
    }
}

export function doAxiosLogging(logReq = true, logResp = true) {
    if (logReq) {
        axios.interceptors.request.use(request => {
            log('Axios.intercept()', 'request', request!.url!);
            return request;
        });
    }
    if (logResp) {
        axios.interceptors.response.use(response => {
            log('Axios.intercept()', 'response', response!.toString());
            return response;
        });
    }
}

export function getPort() {
    return APP_PORT || 3001;
}

export async function doServerLogging() {
    const gatewayAddress = await getGatewayAddress();
    console.info(
        `Server is running`,
        `localIpAddress='${getLocalIpAddress()}:${getPort()}'`,
        `gatewayAddress='${gatewayAddress}'`,
        `hostName='${getHostName()}'`,
    );
}

export function handleError(error: any, res: any, message: string) {
    console.error(message, error);
    res.status(500).json({ error: message });
}

export class UrlError extends Error {
    constructor(public message: string, public url: string) {
        super(message);
        Object.setPrototypeOf(this, UrlError.prototype);
    }
}

/**
 * Utility function to shuffle an array in place using the Fisher-Yates algorithm.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
export function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export function log(method:string, action: string, message: string, userId?: string ) {
    // if (APP_SHOW_LOGGING) console.log(`${userId ? userId+': ' : ''}${method}: ${action} -> ${message}`);
    if (APP_SHOW_LOGGING) console.log(`${method}: ${action} -> ${message}`);
}