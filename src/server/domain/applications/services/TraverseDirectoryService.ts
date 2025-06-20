import fs from 'fs/promises';
import { Dir, Stats } from 'fs';
import path from 'path';

export interface FileNode {
    file: string;
}

export interface DirectoryNode {
    dir: string;
    children: (FileNode | DirectoryNode)[];
}

/** Thrown when the given path isn’t a directory. */
class NotADirectoryError extends Error {
    constructor(dirPath: string) {
        super(`Path is not a directory: ${dirPath}`);
        this.name = 'NotADirectoryError';
    }
}

/** Thrown when a directory (or its subtree) contains no matching files/folders. */
class EmptyDirectoryError extends Error {
    constructor(dirPath: string) {
        super(`Directory is empty (no .cbr/.cbz files or subdirs): ${dirPath}`);
        this.name = 'EmptyDirectoryError';
    }
}

/** Wraps any unexpected errors during traversal to add context. */
class TraverseError extends Error {
    constructor(dirPath: string, original: Error) {
        super(`Error traversing "${dirPath}": ${original.message}`);
        this.name = 'TraverseError';
        this.stack = original.stack;
    }
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
     * @param dirPath  Absolute or relative path to folder
     * @param options.ignoreEmpty  If true, returns `null` on empty dirs instead of throwing
     * @returns {Promise<DirectoryNode>}
     */
    async toJson(
        dirPath: string,
        options: { ignoreEmpty?: boolean } = {}
    ): Promise<DirectoryNode> {
        let stats: Stats;
        try {
            stats = await fs.stat(dirPath);
        } catch (err: any) {
            throw new TraverseError(dirPath, err);
        }

        if (!stats.isDirectory()) {
            throw new NotADirectoryError(dirPath);
        }

        let dirHandle: Dir;
        try {
            dirHandle = await fs.opendir(dirPath);
        } catch (err: any) {
            throw new TraverseError(dirPath, err);
        }

        const directories: DirectoryNode[] = [];
        const files: FileNode[] = [];

        try {
            let entry;
            // Manual read loop to ensure single close
            // `for-await-of` auto-closes on break/error, which can lead to double-close errors
            while ((entry = await dirHandle.read()) !== null) {
                const name = entry.name;
                if (SYSTEM_FOLDERS.includes(name)) continue;

                const fullPath = path.join(dirPath, name);

                try {
                    if (entry.isDirectory()) {
                        const nested = await this.toJson(fullPath, options);
                        if (nested) {
                            directories.push(nested);
                        }
                    } else if (entry.isFile() && /\.(cbr|cbz)$/i.test(name)) {
                        files.push({ file: name });
                    }
                } catch (err: any) {
                    if (err instanceof EmptyDirectoryError && options.ignoreEmpty) {
                        continue;
                    }
                    throw err;
                }
            }
        } finally {
            // Always close exactly once
            try {
                await dirHandle.close();
            } catch {
                // Ignore if already closed
            }
        }

        if (directories.length === 0 && files.length === 0) {
            throw new EmptyDirectoryError(dirPath);
        }

        directories.sort((a, b) => a.dir.localeCompare(b.dir));
        files.sort((a, b) => a.file.localeCompare(b.file));

        return {
            dir: dirPath,
            children: [...directories, ...files],
        };
    }
}