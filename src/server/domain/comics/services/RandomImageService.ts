import axios, { AxiosBasicCredentials } from 'axios';

export default class RandomImageService {
    constructor(private KOMGA_API: string, private KOMGA_AUTH: AxiosBasicCredentials) {}

    async getImage(bookId: string, page: number): Promise<{ image: Buffer; contentType: string }> {
        try {
            const response = await axios.get(`${this.KOMGA_API}/books/${bookId}/pages/${page}`, {
                params: { zero_based: true, contentNegotiation: true },
                responseType: 'arraybuffer',
                auth: this.KOMGA_AUTH,
            });

            return {
                image: Buffer.from(response.data), // Return raw image data
                contentType: response.headers['content-type'],
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch image: ${error.message}`);
        }
    }

    async getBookId(randomIndex: number): Promise<string> {
        try {
            const response = await axios.get(`${this.KOMGA_API}/books`, {
                params: { page: randomIndex, size: 1 },
                auth: this.KOMGA_AUTH,
            });

            const bookId = response.data.content[0]?.id;
            if (!bookId) throw new Error('No book ID found.');
            return bookId;
        } catch (error: any) {
            throw new Error(`Failed to fetch book ID: ${error.message}`);
        }
    }

    async getTotalItems(): Promise<number> {
        try {
            const response = await axios.get(`${this.KOMGA_API}/books`, {
                params: { size: 1 },
                auth: this.KOMGA_AUTH,
            });

            const totalItems = response.data.totalPages;
            if (!totalItems) throw new Error('No books found.');
            return totalItems;
        } catch (error: any) {
            throw new Error(`Failed to fetch total books: ${error.message}`);
        }
    }
}
