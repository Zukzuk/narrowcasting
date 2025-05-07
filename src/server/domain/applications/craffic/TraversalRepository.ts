import { DirectoryNode } from "../services/TraverseDirectoryService.js";
import { log } from "../../../utils.js";

/**
 * This class is responsible for storing and retrieving the directory structure of a library.
 * 
 * @exports
 * @class TraversalRepository
 */
export default class TraversalRepository {
    private cache: Record<string, DirectoryNode>;

    constructor() {
        this.cache = {};
    }

    // TODO: Add userId logic

    /**
     * Saves the directory structure of a library.
     * 
     * @param {string} library - The library name.
     * @param {DirectoryNode} json - The directory structure.
     * @returns {DirectoryNode} The directory structure.
     */
    save(library: string, json: DirectoryNode): DirectoryNode {
        if (!this.cache[library]) this.cache[library] = {dir: '', children: []};
        this.cache[library] = json;
        const payload = this.cache[library];

        // log('TraversalRepository.save', library, JSON.stringify(payload));

        return payload;
    }

    /**
     * Retrieves the directory structure of a library.
     * 
     * @param {string} library - The library name.
     * @returns {DirectoryNode} The directory structure.
     */
    retrieve(library: string): DirectoryNode {
        const payload = this.cache[library] || null;

        // if (payload) log('TraversalRepository.retrieve', library, JSON.stringify(payload));

        return payload;
    }
}
