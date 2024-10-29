const os = require('os');

// General utility to get local IP address
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

module.exports = {
    getLocalIpAddress,
};
