import express from 'express';
import { handleError } from '../../utils.js';
import ComicsCrawlReadModel from '../../interfaces/readmodels/ComicsCrawlReadModel.js';

import { promises as fs } from 'fs';
import path from 'path';

const router = express.Router();

/**
const cancelToken = axios.CancelToken.source();
req.on('close', () => {
    cancelToken.cancel("Client disconnected, request canceled.");
});
try {
    // do something  
} catch (error: any) {
    if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return;
    }
    handleError(error, res, "Some error occurred");
}
*/

export default function ComicsApi(
    models: {
        comicsCrawlReadModel: ComicsCrawlReadModel,
    }
) {
    const {
        comicsCrawlReadModel,
    } = models;

    /**
     * @openapi
     * /api/query/comics/series:
     *   get:
     *     tags: 
     *       - query
     *     summary: Crawl series
     *     description: Initiates fetch of series data
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term
     *     responses:
     *       200:
     *         description: Successfully fetched data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       500:
     *         description: Internal Server Error or no valid content found
     */
    router.get('/query/comics/series', async (req: any, res: any) => {
        const { search } = req.query;
        try {
            const response = await comicsCrawlReadModel.query({ userId: req.session.userId, endpoint: 'series', search });
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting crawled series");
        }
    });

    /**
     * @openapi
     * /api/query/comics/collections:
     *   get:
     *     tags: 
     *       - query
     *     summary: Crawl collections
     *     description: Initiates a fetch of collections data
     *     parameters:
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term
     *     responses:
     *       200:
     *         description: Successfully fetched data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *       500:
     *         description: Internal Server Error or no valid content found
     */
    router.get('/query/comics/collections', async (req: any, res: any) => {
        const { search } = req.query;
        try {
            const response = await comicsCrawlReadModel.query({ userId: req.session.userId, endpoint: 'collections', search });
            if (!response) return res.status(500).json({ error: "No valid content found" });
            res.json(response);
        } catch (error: any) {
            handleError(error, res, "Error requesting crawled collections");
        }
    });

    // Define the type for the JSON structure
    interface FileNode {
        file: string;
    }

    interface DirectoryNode {
        dir: string;
        children: (FileNode | DirectoryNode)[];
    }

    // Define system folders or files to exclude
    const SYSTEM_FOLDERS = ['Recycle Bin', '.DS_Store', 'Thumbs.db'];

    /**
     * @openapi
     * /api/query/comics/json:
     *   get:
     *     tags: 
     *       - experimental
     *     summary: Retrieve the JSON representation of a comics directory
     *     description: Returns a JSON representation of a directory containing `.cbr` and `.cbz` files, organized hierarchically.
     *     parameters:
     *       - name: startDir
     *         in: query
     *         description: The root directory path to start the crawl.
     *         required: true
     *         schema:
     *           type: string
     *           example: "mounts/comics"
     *     responses:
     *       '200':
     *         description: Successfully retrieved the comics directory structure.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 dir:
     *                   type: string
     *                   description: The absolute path of the directory.
     *                 children:
     *                   type: array
     *                   items:
     *                     type: object
     *                     description: A file or a nested directory.
     *                     properties:
     *                       file:
     *                         type: string
     *                         description: The name of the file (only present if type is `file`).
     *       '500':
     *         description: Internal server error (e.g., file system issues).
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   description: Error message describing what went wrong.
     */
    router.get('/query/comics/json', async (req: any, res: any) => {
        const { startDir } = req.query;

        try {
            async function dirToJson(dirPath: string): Promise<DirectoryNode | null> {
                const stats = await fs.stat(dirPath);
                if (!stats.isDirectory()) return null;

                const dir = await fs.opendir(dirPath);
                const directories: DirectoryNode[] = [];
                const files: FileNode[] = [];

                for await (const entry of dir) {
                    // Skip system folders or files
                    if (SYSTEM_FOLDERS.includes(entry.name)) continue;
                    const fullPath = path.join(dirPath, entry.name);

                    if (entry.isDirectory()) {
                        const nested = await dirToJson(fullPath);
                        if (nested) directories.push(nested);
                    } else if (entry.isFile() && /\.(cbr|cbz)$/i.test(entry.name)) {
                        files.push({ file: entry.name });
                    }
                }

                if (files.length > 0 || directories.length > 0) {
                    return {
                        dir: dirPath,
                        children: [
                            ...directories.sort((a, b) => a.dir.localeCompare(b.dir)),
                            ...files.sort((a, b) => a.file.localeCompare(b.file)),
                        ],
                    };
                }

                return null;
            }

            const result = await dirToJson(startDir);
            res.json(result);
        } catch (error: any) {
            console.error('Error requesting comics directory structure:', error);
            res.status(500).json({
                error: 'Error requesting comics directory structure',
                details: error.message,
            });
        }
    });

    return router;
}
