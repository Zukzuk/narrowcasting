import sharp from 'sharp';

export default class ImageOptimizationService {
    async optimizeImage(image: Buffer, contentType: string): Promise<{ optimizedImage: Buffer; optimizedContentType: string }> {
        if (contentType === 'image/jp2' || contentType === 'image/jpeg2000') {
            throw new Error('Unsupported image format');
        }

        // Optimize the image and set the new content type
        const optimizedImage = await sharp(image)
            .resize({ width: 3840, height: 2160, fit: 'inside' })
            .toFormat('webp', { quality: 80 })
            .toBuffer();

        return { optimizedImage, optimizedContentType: 'image/webp' };
    }
}
