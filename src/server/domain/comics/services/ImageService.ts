import axios, { AxiosBasicCredentials } from 'axios';

export default class ImageService {

    constructor(private KOMGA_API: string, private KOMGA_AUTH: AxiosBasicCredentials) {}

    async fetchTotalBooks(): Promise<number> {
        try {
            const response = await axios.get(`${this.KOMGA_API}/books`, {
                params: { size: 1 },
                auth: this.KOMGA_AUTH
            });
            const total = response.data.totalPages;
            if (!total) throw new Error("No books found.");
            return total;
        } catch (error) {
            throw new Error(`Failed fetchTotalBooks: ${error}`);
        }
    }

    async fetchBookId(randomIndex: number): Promise<string> {
        try {
            const response = await axios.get(`${this.KOMGA_API}/books`, {
                params: { page: randomIndex, size: 1 },
                auth: this.KOMGA_AUTH,
            });
            const bookId = response.data.content[0]?.id;
            if (!bookId) throw new Error("No book ID found.");
            return bookId;
        } catch (error) {
            throw new Error(`Failed fetchBookId: ${error}`);
        }
    }

    async fetchImage(
        bookId: string,
        page: number,
        interval: number,
        startTime: number,
        retryCount: number
    ): Promise<Buffer | "RETRY"> {
        try {
            const image = await axios.get(`${this.KOMGA_API}/books/${bookId}/pages/${page}`, {
                params: { zero_based: true, contentNegotiation: true },
                responseType: 'arraybuffer',
                auth: this.KOMGA_AUTH,
            });
            const contentType = image.headers['content-type'];
            if (contentType === 'image/jp2' || contentType === 'image/jpeg2000')
                throw new Error("Unsupported image format");
            return Buffer.from(image.data);
        } catch (error: any) {
            if (error.message === "Unsupported image format") {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = interval - elapsedTime;
                if (remainingTime > 5000) {
                    console.log(`Retry attempt ${retryCount} with ${remainingTime}ms remaining`);
                    return "RETRY";
                } else {
                    console.log(`No retry attempt because remaining time in interval (${remainingTime}ms) is too short...`);
                }
            }
            throw new Error(`Failed fetchImage: ${error.message}`);
        }
    }
}
