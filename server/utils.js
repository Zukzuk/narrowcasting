const os = require('os');
// const defaultGateway = require('default-gateway');

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

module.exports = {
    localIpAddress: getLocalIpAddress,
    hostName: getHostName,
    // gatewayAddress: getGatewayAddress,
    port: getPort,
}