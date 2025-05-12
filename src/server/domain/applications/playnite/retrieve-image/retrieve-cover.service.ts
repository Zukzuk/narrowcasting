import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import unzipper from 'unzipper';
import { UrlError } from '../../../../utils.js';
import { PLAYNITE_BACKUP_ORIGIN } from '../../../../config.js';

export interface IPlayniteGamesContainer {
    name: string;
    folderPath: string;
}

/**
 * Service to fetch game cover images from a Playnite backup folder.
 * 
 * @class RetrieveCoverService
 */
export default class RetrieveCoverService {

    constructor() { }

    // TODO: !! Should read from .zip file instead of the extracted folder
    unzip = async (): Promise<void> => {
        fs.createReadStream('mounts/playnite/PlayniteBackup-2024-12-22-15-37-36.zip')
            .pipe(unzipper.Parse())
            .on('entry', function (entry) {
                const fileName = entry.path;
                const type = entry.type; // 'Directory' or 'File'

                if (fileName === 'libraryfiles/0a0a55c3-363b-48c3-9e40-52cfbcdf480e/08dd0301-8e8b-4d1d-9dca-24da8ddfb27e.jpg') {
                    entry.pipe(fs.createWriteStream('output/test.jpg'));
                } else {
                    entry.autodrain();
                }
            })
            .promise()
            .then(() => {
                console.log('Specific file extracted');
            })
            .catch(err => {
                console.error('Extraction failed:', err);
            });
    }

    /**
     * Fetches the games data from the Playnite backup folder.
     * 
     * @returns {IPlayniteGamesContainer[]}
     */
    fetchGamesData = (): IPlayniteGamesContainer[] => {
        const resolvedPath = path.resolve(PLAYNITE_BACKUP_ORIGIN);

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
