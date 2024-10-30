const fs = require('fs').promises;
const { INPUT_FILE, OUTPUT_FILE } = require('./config');

// Shuffle array elements
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function convertJp2ToPng(imageBuffer) {
  const { execa } = await import('execa');
  try {
    // Save buffer to the JPEG 2000 file for OpenJPEG processing
    await fs.writeFile(INPUT_FILE, imageBuffer);
    // Convert the JPEG 2000 file to JPG
    try {
        // Run opj_decompress using execa, ensuring paths are sanitized and exist
        await execa('opj_decompress', ['-i', INPUT_FILE, '-o', OUTPUT_FILE]);
        console.log("JPEG 2000 file successfully decompressed to PNG format.");
    } catch (error) {
        console.error("Error during JPEG 2000 decompression:", error);
        throw new Error(`Decompression failed: ${error.message}`);
    };
    return await fs.readFile(OUTPUT_FILE);
    } catch (error) {
        console.error("Error parsing image:", error);
        throw error;
    } finally {
        // Clean up temporary files
        await Promise.all([
            fs.unlink(INPUT_FILE).catch(() => {}),
            fs.unlink(OUTPUT_FILE).catch(() => {})
        ]);
    }
}

async function parseImage(image) {
    try {
        let imageBuffer = Buffer.from(image.data, 'binary');
        const contentType = image.headers['content-type'];
        console.log("contentType", contentType);
        if (contentType === 'image/jp2' || contentType === 'image/jpeg2000') {
            imageBuffer = await convertJp2ToPng(imageBuffer);
        }
        return { image: imageBuffer.toString('base64'), contentType };
    } catch (error) {
        console.error("Error parsing image:", error);
        throw error;
    }
}

// Error handling helper
function handleError(error, res, message) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}

module.exports = {
    shuffleArray,
    parseImage,
    handleError
};
