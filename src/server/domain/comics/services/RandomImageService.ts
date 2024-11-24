import axios, { AxiosBasicCredentials } from 'axios';
import sharp from 'sharp';

export default class RandomImageService {
    private totalBooks: {
        value: number,
        expiration: number
    } = {
            value: 0,
            expiration: 0
        };

    constructor(private KOMGA_API: string, private KOMGA_AUTH: AxiosBasicCredentials, private APP_CACHE_DURATION: number) { }

    async #optimizeImage(image: Buffer): Promise<{ image: Buffer, contentType: string }> {
        // Use sharp to resize and optimize the image for 4K
        const optimizedImage = await sharp(image)
            .resize({ width: 3840, height: 2160, fit: 'inside' })
            .toFormat('webp', { quality: 90 })
            .toBuffer();
        return { image: optimizedImage, contentType: 'image/webp' };
    }

    // Fetch image by book ID and page
    async #fetchImage(
        bookId: string,
        page: number,
        interval: number,
        startTime: number,
        retryCount: number
    ): Promise<Buffer | "RETRY"> {
        console.log('fetchImage attempt', retryCount);
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
            throw new Error(`Failed to fetch image: ${error.message}`);
        }
    }

    // Fetch a random book ID
    async #fetchBookId(randomIndex: number): Promise<string> {
        console.log('fetchBookId');
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

    // Fetch total number of sets
    async #fetchTotalBooks(): Promise<number> {
        console.log('fetchTotalBooks');
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

    // General cache and/or fetch logic
    async #retrieveTotalBooks(): Promise<number> {
        const currentTime = Date.now();
        if (this.totalBooks.value !== 0 && currentTime < this.totalBooks.expiration) {
            return Promise.resolve(this.totalBooks.value);
        }
        return this.#fetchTotalBooks().then((total: number) => {
            this.totalBooks.value = total;
            this.totalBooks.expiration = currentTime + this.APP_CACHE_DURATION;
            return total;
        });
    }

    #shuffleArray(array: number[]): number[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Retrieve a random unused index from session set
    async #retrieveRandomIndex(session: any): Promise<number> {
        if (!session.indexSet || session.indexSet.length === 0) {
            await this.#retrieveTotalBooks();
            session.indexSet = Array.from({ length: this.totalBooks.value }, (_, i) => i);
        }
        const randomIndex = Math.floor(Math.random() * session.indexSet.length);
        return this.#shuffleArray(session.indexSet).splice(randomIndex, 1)[0];
    }

    async randomImage(
        page: number,
        interval: number,
        session: any,
        startTime: number = Date.now(),
        retryCount: number = 0
    ): Promise<{
        image: Buffer,
        contentType: string,
        bookId: string,
        totalItems: number
    }
    > {
        const randomIndex = await this.#retrieveRandomIndex(session);
        const bookId = await this.#fetchBookId(randomIndex);
        const response = await this.#fetchImage(bookId, page, interval, startTime, retryCount);
        const { image, contentType } = 
            (response === "RETRY")
                ? await this.randomImage(page, interval, session, startTime, retryCount + 1) // Retry
                : await this.#optimizeImage(response); // Optimize
        return { bookId, image, contentType, totalItems: this.totalBooks.value };
    }
}
