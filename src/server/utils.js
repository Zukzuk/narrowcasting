import os from 'os';
// import defaultGateway from 'default-gateway';
import axios from 'axios';

function getLocalIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const networkInterface = networkInterfaces[interfaceName];
        for (const addressInfo of networkInterface) {
            if (addressInfo.family === 'IPv4' && !addressInfo.internal) {
                return addressInfo.address;
            }
        }
    }
    return 'IP not found';
}

function getPort() {
    return 3000;
}

function getHostName() {
    return os.hostname();
}

// async function getGatewayAddress() {
//     try {
//         const result = await defaultGateway.v4(); // Get IPv4 gateway address
//         return result.gateway;
//     } catch (err) {
//         console.error('Error getting gateway address:', err);
//         return 'Gateway not found';
//     }
// }

function doAxiosLogging(logReq = true, logResp = true) {
    // axios logging
    if (logReq) {
        axios.interceptors.request.use(request => {
            console.log('Call', request.url, request.params ? request.params : '');
            return request;
        });
    }
    if (logResp) {
        axios.interceptors.response.use(response => {
            console.log('Response', response);
            return response;
        });
    }
}

export {
    getLocalIpAddress,
    getHostName,
    // getGatewayAddress,
    getPort,
    doAxiosLogging,
}