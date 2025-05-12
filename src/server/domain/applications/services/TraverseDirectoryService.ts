import { promises as fs } from 'fs';
import path from 'path';

export interface FileNode {
    file: string;
}

export interface DirectoryNode {
    dir: string;
    children: (FileNode | DirectoryNode)[];
}

// Define system folders or files to exclude
const SYSTEM_FOLDERS = ['#recycle', '@eaDir', 'Recycle Bin', '.DS_Store', 'Thumbs.db'];

/**
 * Service to traverse a directory and return a JSON representation of its contents
 * 
 * @class TraverseDirectoryService
 */
export default class TraverseDirectoryService {
    constructor() { }

    /**
     * Recursively traverse a directory and return a JSON representation of its contents
     * 
     * @param {string} dirPath
     * @returns {Promise<DirectoryNode>}
     */
    async toJson(dirPath: string): Promise<DirectoryNode> {
        const stats = await fs.stat(dirPath);
        console.log('dirPath', dirPath);
        if (!stats.isDirectory()) throw new Error(`Path '${dirPath}' is not a directory`);

        const dir = await fs.opendir(dirPath);
        const directories: DirectoryNode[] = [];
        const files: FileNode[] = [];

        for await (const entry of dir) {
            // Skip system folders or files
            if (SYSTEM_FOLDERS.includes(entry.name)) continue;
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                const nested = await this.toJson(fullPath);
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

        throw new Error('No files or directories found');
    }
}