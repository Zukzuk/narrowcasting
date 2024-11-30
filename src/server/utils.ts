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