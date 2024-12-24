import os from 'os';
import defaultGateway from 'default-gateway';
import axios from 'axios';

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

function doAxiosLogging(logReq = true, logResp = true) {
    // axios logging
    if (logReq) {
        axios.interceptors.request.use(request => {
            console.log('Axios: request ->', request.url);
            return request;
        });
    }
    if (logResp) {
        axios.interceptors.response.use(response => {
            console.log('Axios: response ->', response);
            return response;
        });
    }
}

export function getPort() {
    return 3000;
}

export async function doServerLogging() {
    doAxiosLogging(true, false);
    const gatewayAddress = await getGatewayAddress();
    console.log(
        `Server is running`,
        `Address='${getLocalIpAddress()}:${getPort()}'`,
        `gatewayAddress='${gatewayAddress}'`,
        `Hostname='${getHostName()}'`,
    );
}

export function handleError(error: any, res: any, message: string) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}

export class UrlError extends Error {
    url: string;

    constructor(message: string, url: string) {
        super(message);
        this.url = url;
        Object.setPrototypeOf(this, UrlError.prototype);
    }
}

export class RetryError extends Error {
    retry: boolean;
    startTime: number;
    url: string;

    constructor(message: string, startTime: number, url: string) {
        super(message);
        this.retry = true;
        this.startTime = startTime;
        this.url = url;
        Object.setPrototypeOf(this, RetryError.prototype);
    }
}

export function shuffleArray(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}