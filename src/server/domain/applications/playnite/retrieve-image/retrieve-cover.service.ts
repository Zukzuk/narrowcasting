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

    // For single, on-demand file extraction under tight memory budgets ➔ use streaming (.Parse()).
    // For random access, quick lookups, or when you’ll extract multiple files in arbitrary order ➔ use Open.file().

    /**
     * Fetches the games data by opening the latest PlayniteBackup-YYYY-MM-DD.zip
     * and listing its first‐level directories.
     * 
     * @returns {IPlayniteGamesContainer[]}
     */
    fetchGamesData = async (): Promise<IPlayniteGamesContainer[]> => {
        const latestZipPath = await this.#getLatestZipPath();

        try {
            const directory = await unzipper.Open.file(latestZipPath);

            // Collect all libraryfiles/<GameId> from file entries
            const gameIdSet = new Set<string>();
            for (const entry of directory.files) {
                if (entry.type !== "File") continue;

                // split on either slash or backslash
                const parts = entry.path.split(/[\\/]+/);
                // parts[0] === 'libraryfiles'
                // parts[1] === '<GameId>'
                if (parts[0] === "libraryfiles" && parts.length >= 3) {
                    gameIdSet.add(parts[1]);
                }
            }

            // Build containers array
            const containers: IPlayniteGamesContainer[] = Array.from(gameIdSet).map(
                (gameId) => ({
                    name: gameId,
                    folderPath: `libraryfiles/${gameId}/`,  // normalized to forward-slashes
                })
            );

            return containers;
        } catch (err: any) {
            throw new UrlError(
                `Failed to read ZIP ${latestZipPath}: ${err.message}`,
                latestZipPath
            );
        }
    };

    /**
     * Fetches the largest portrait image from the given folder INSIDE the specified ZIP.
     *
     * @param internalDir   Name of the folder inside the ZIP (e.g. "3b462f0b-9f72-4f52-9cb1-50aeb43d794c")
     * @returns             Promise<Buffer> of the largest portrait image
     */
    fetchImage = async (internalDir: string): Promise<Buffer> => {
        const latestZipPath = await this.#getLatestZipPath();
        const normalize = (str: string) => str.replace(/\\/g, "/");
        internalDir = normalize(internalDir).replace(/\/+$/, "");

        try {
            const directory = await unzipper.Open.file(latestZipPath);
            const imageEntries = directory.files.filter((entry) => {
                if (entry.type !== "File") return false;

                const p = normalize(entry.path);
                // split into ["PlayniteBackup-…", "libraryfiles", "<ID>", "file.jpg"]
                const parts = p.split("/");

                // find the "libraryfiles" segment
                const libIdx = parts.indexOf("libraryfiles");
                if (libIdx < 0) return false;

                // ensure the next segment is your game ID
                if (parts[libIdx + 1] !== internalDir.split("/")[1]) return false;

                // ensure exactly one filename under that folder (no deeper nesting)
                // parts = [..., "libraryfiles", "<ID>", "filename.jpg"]
                if (parts.length !== libIdx + 3) return false;

                // finally, check it’s an image
                return /\.(jpe?g|png|webp)$/i.test(parts[libIdx + 2]);
            });

            let largestBuffer: Buffer | null = null;
            let largestSize = 0;

            for (const entry of imageEntries) {
                try {
                    const buf = await entry.buffer();
                    const meta = await sharp(buf).metadata();
                    if (meta.width! < meta.height! && buf.length > largestSize) {
                        largestBuffer = buf;
                        largestSize = buf.length;
                    }
                } catch (fileErr: any) {
                    console.warn(`Skipping ${entry.path}: ${fileErr.message}`);
                }
            }

            if (!largestBuffer) {
                throw new Error(
                    `No portrait images found in "${internalDir}" of ${latestZipPath}`
                );
            }

            return largestBuffer;
        } catch (err: any) {
            throw new UrlError(`Failed fetchImageFromZip: ${err.message}`, latestZipPath);
        }
    };

    #getLatestZipPath = async (): Promise<string> => {
        const resolvedPath = path.resolve(PLAYNITE_BACKUP_ORIGIN);
        const allFiles = fs.readdirSync(resolvedPath);

        // map only the PlayniteBackup-*.zip files, pulling out the timestamp
        const backups = allFiles
            .map((file) => {
                const m = file.match(
                    /^PlayniteBackup-(\d{4}-\d{2}-\d{2}(?:-\d{2}-\d{2}-\d{2}))\.zip$/
                );
                if (!m) return null;
                return { file, timestamp: m[1] }; // e.g. "2025-06-15-21-25-14"
            })
            .filter((x): x is { file: string; timestamp: string } => !!x)
            .sort((a, b) =>
                // lexicographic compare works for ISO‐style timestamps
                a.timestamp.localeCompare(b.timestamp)
            );

        if (backups.length === 0) {
            throw new UrlError(
                `No Playnite backups found in ${resolvedPath}`,
                resolvedPath
            );
        }

        const latest = backups[backups.length - 1].file;
        return path.join(resolvedPath, latest);
    };
}
