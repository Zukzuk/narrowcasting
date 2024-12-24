import axios, { AxiosBasicCredentials } from 'axios';
import { UrlError } from '../../../utils.js';
import { TMediaType } from '../../../domain/shared/types/index.js';

export default class ComicsImageService {

    constructor(
        private KOMGA_API: string, 
        private KOMGA_AUTH: AxiosBasicCredentials
    ) {}

    fetchTotalBooks = async (): Promise<number> => {
        const url = `${this.KOMGA_API}/books`;
        try {
            const response = await axios.get(url, {
                params: { size: 1 },
                auth: this.KOMGA_AUTH
            });
            const total = response.data.totalPages;
            if (!total) throw new Error("No books found.");
            return total;
        } catch (error: any) {
            throw new UrlError(`Failed fetchTotalBooks: ${error.message}`, url);
        }
    }

    fetchBookId = async (randomIndex: number): Promise<string> => {
        const url = `${this.KOMGA_API}/books`;
        try {
            const response = await axios.get(url, {
                params: { page: randomIndex, size: 1 },
                auth: this.KOMGA_AUTH,
            });
            const bookId = response.data.content[0]?.id;
            if (!bookId) throw new Error("No book ID found.");
            return bookId;
        } catch (error: any) {
            throw new UrlError(`Failed fetchBookId: ${error.message}`, url);
        }
    }

    fetchImage = async (
        bookId: string,
        page: number,
    ): Promise<Buffer> => {
        const url = `${this.KOMGA_API}/books/${bookId}/pages/${page}`;
        try {
            const image = await axios.get(url, {
                params: { zero_based: true, contentNegotiation: true },
                responseType: 'arraybuffer',
                auth: this.KOMGA_AUTH,
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
