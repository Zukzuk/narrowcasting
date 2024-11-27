import sharp from 'sharp';

export default class ImageOptimizeService {
    constructor() {}

    async webp(image: Buffer, quality: number = 80): Promise<{ optimizedImage: Buffer, contentType: string }> {
        // Use sharp to resize and optimize the image for 4K
        const optimizedImage = await sharp(image)
            .resize({ width: 3840, height: 2160, fit: 'inside' })
            .toFormat('webp', { quality })
            .toBuffer();
        return { optimizedImage, contentType: 'image/webp' };
    }
}