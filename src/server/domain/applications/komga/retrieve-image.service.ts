import axios from 'axios';
import { UrlError } from '../../../utils.js';
import { KOMGA_API, KOMGA_AUTH } from '../../../config.js';

/**
 * Service for fetching comic images from Komga.
 * 
 * @class RetrieveImageService
 */
export default class RetrieveImageService {

    constructor() {}

    /**
     * Fetch the total number of books.
     * 
     * @returns {Promise<number>}
     */
    fetchTotalBooks = async (): Promise<number> => {
        const url = `${KOMGA_API}/books`;
        try {
            const response = await axios.get(url, {
                params: { size: 1 },
                auth: KOMGA_AUTH
            });
            const total = response.data.totalPages;
            if (!total) throw new Error("No books found.");
            return total;
        } catch (error: any) {
            throw new UrlError(`Failed fetchTotalBooks: ${error.message}`, url);
        }
    }

    /**
     * Fetch a random book ID.
     * 
     * @param {number} randomIndex
     * @returns {Promise<string>}
     */
    fetchBookId = async (randomIndex: number): Promise<string> => {
        const url = `${KOMGA_API}/books`;
        try {
            const response = await axios.get(url, {
                params: { page: randomIndex, size: 1 },
                auth: KOMGA_AUTH,
            });
            const bookId = response.data.content[0]?.id;
            if (!bookId) throw new Error("No book ID found.");
            return bookId;
        } catch (error: any) {
            throw new UrlError(`Failed fetchBookId: ${error.message}`, url);
        }
    }

    /**
     * Fetch a comic image.
     * 
     * @param {string} bookId
     * @param {number} page
     * @returns {Promise<Buffer>}
     */
    fetchImage = async (
        bookId: string,
        page: number,
    ): Promise<Buffer> => {
        const url = `${KOMGA_API}/books/${bookId}/pages/${page}`;
        try {
            const image = await axios.get(url, {
                params: { zero_based: true, contentNegotiation: true },
                responseType: 'arraybuffer',
                auth: KOMGA_AUTH,
            });
            const contentType = image.headers['content-type'];
            if (contentType === 'image/jp2' || contentType === 'image/jpeg2000')
                throw new Error("Unsupported image format");
            return Buffer.from(image.data);
        } catch (error: any) {
            throw new UrlError(`Failed fetchImage: ${error.message}`, url);
        }
    }
}
