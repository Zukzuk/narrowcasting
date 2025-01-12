import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { UrlError } from '../../../../utils.js';

export interface IPlayniteGamesContainer {
    name: string;
    folderPath: string;
}

/**
 * Service to fetch game cover images from a Playnite backup folder.
 * 
 * @class GamesImageService
 */
export default class GamesImageService {

    constructor(
        private PLAYNITE_BACKUP_ORIGIN: string,
    ) { }

    // TODO: !! Should read from .zip file instead of the extracted folder

    /**
     * Fetches the games data from the Playnite backup folder.
     * 
     * @returns {IPlayniteGamesContainer[]}
     * @memberof GamesImageService
     */
    fetchGamesData = (): IPlayniteGamesContainer[] => {
        const resolvedPath = path.resolve(this.PLAYNITE_BACKUP_ORIGIN);

        try {
            const subfolders: IPlayniteGamesContainer[] = [];
            const items = fs.readdirSync(resolvedPath, { withFileTypes: true });

            for (const item of items) {
                if (item.isDirectory()) {
                    subfolders.push({
                        name: item.name,
                        folderPath: path.join(resolvedPath, item.name),
                    });
                }
            }

            return subfolders;
        } catch (error: any) {
            throw new UrlError(`Failed fetchGamesData: ${error.message}`, resolvedPath);
        }
    };

    /**
     * Fetches the largest portrait image from a given folder.
     * 
     * @param {string} folderPath
     * @returns {Promise<Buffer>}
     * @memberof GamesImageService
     */
    fetchImage = async (folderPath: string): Promise<Buffer> => {
        const resolvedPath = path.resolve(folderPath);
    
        // Filter for image files
        const imageFiles = fs
            .readdirSync(resolvedPath)
            .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
            .map((file) => path.join(resolvedPath, file));
    
        let largestImageBuffer: Buffer | null = null;
        let largestImageSize = 0;
    
        for (const filePath of imageFiles) {
            try {
                // Read the file into a buffer
                const imageBuffer = fs.readFileSync(filePath);
                const { width, height } = await sharp(imageBuffer).metadata();
    
                // Check if it's a portrait image
                if (width && height && height > width) {
                    // Check if it's the largest so far
                    if (imageBuffer.length > largestImageSize) {
                        largestImageBuffer = imageBuffer;
                        largestImageSize = imageBuffer.length;
                    }
                }
            } catch (error) {
                console.error(`Error processing image file ${filePath}:`, error);
            }
        }
    
        try {
            // Ensure we have a valid buffer to return
            if (!largestImageBuffer) throw new Error("No valid portrait image found.");
            return largestImageBuffer;
        } catch (error: any) {
            throw new UrlError(`Failed fetchImage: ${error.message}`, resolvedPath);
        }
    };

}
