const os = require('os');
const sharp = require('sharp');

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

// Shuffle array elements
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Parse image to handle different formats
async function parseImage(image) {
    const imageBuffer = Buffer.from(image.data, 'binary');
    const contentType = image.headers['content-type'];
    if (contentType === 'image/jp2' || contentType === 'image/jpeg2000') {
        const convertedImageBuffer = await sharp(imageBuffer).jpeg().toBuffer();
        return { image: Buffer.from(convertedImageBuffer, 'binary').toString('base64'), contentType: 'image/jpeg' };
    }
    return { image: Buffer.from(imageBuffer, 'binary').toString('base64'), contentType };
}

// Error handling helper
function handleError(error, res, message) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}

module.exports = {
    getLocalIpAddress,
    shuffleArray,
    parseImage,
    handleError
};
