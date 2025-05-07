import sharp from 'sharp';

/**
 * Service to optimize images
 * 
 * @class ImageOptimizeService
 */
export default class ImageOptimizeService {
    constructor() {}

    /**
     * Optimize the image for 4K resolution
     * 
     * @param {Buffer} image The image to optimize
     * @param {number} [quality=80] The quality of the image
     * @returns {Promise<{ optimizedImage: Buffer, contentType: string }>}
     * @memberof ImageOptimizeService
     */
    async webp(image: Buffer, quality: number = 80): Promise<{ optimizedImage: Buffer, contentType: string }> {
        // Use sharp to resize and optimize the image for 4K
        const optimizedImage = await sharp(image)
            .resize({ width: 3840, height: 2160, fit: 'inside' })
            .toFormat('webp', { quality })
            .toBuffer();
        return { optimizedImage, contentType: 'image/webp' };
    }
}