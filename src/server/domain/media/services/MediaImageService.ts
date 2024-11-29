import axios from 'axios';

export interface IPlexMediaSections {
    key: string,
    title: "comics" | "audiobooks" | "movies" | "series" | "animated-movies" | "animated-series";
}

export interface IPlexMediaContainer {
    ratingKey: string;          // '324'
    key: string;                // '/library/metadata/324'
    guid: string;               // 'plex://movie/5d77683a880197001ec946c0'
    type: string;               // 'movie'
    title: string;              // 'Angels & Demons'
    year: number;               // 2009
    thumb: string;              // '/library/metadata/324/thumb/1729479178'
    art: string;                // '/library/metadata/324/art/1729479178'
    primaryExtraKey: string;    // '/library/metadata/622'
}

export default class MediaImageService {

    constructor(
        private PLEX_API_KEY: string,
        private PLEX_API: string,
    ) {}

    fetchSections = async (): Promise<IPlexMediaSections[]> => {
        try {
            const response = await axios.get(`${this.PLEX_API}/library/sections`, {
                params: { 'X-Plex-Token': this.PLEX_API_KEY },
                headers: { Accept: 'application/json' },
            });
            if (!response.data) throw new Error("No sections found.");
            return response.data.MediaContainer.Directory;
        } catch (error: any) {
            throw new Error(`Failed fetchSections: ${error}`);
        }
    }

    fetchSectionMedia = async (domain: string, movieKey: string): Promise<IPlexMediaContainer[]> => {
        try {
            const response = await axios.get(`${this.PLEX_API}/library/sections/${movieKey}/${domain === 'audiobooks' ? 'albums' : 'all'}`, {
                params: { 'X-Plex-Token': this.PLEX_API_KEY },
                headers: { Accept: 'application/json' },
            });
            if (!response.data) throw new Error("No media found.");
            return response.data.MediaContainer.Metadata;
        } catch (error: any) {
            throw new Error(`Failed fetchSectionMedia: ${error}`);
        }
    }

    fetchImage = async (
        thumb: string,
        interval: number,
        startTime: number,
        retryCount: number
    ): Promise<Buffer> => {
        try {
            const image = await axios.get(`${this.PLEX_API}${thumb}`, {
                params: { 'X-Plex-Token': this.PLEX_API_KEY },
                responseType: 'arraybuffer',
            });
            if (!image.data) throw new Error("No image found.");
            return Buffer.from(image.data);
        } catch (error: any) {
            throw new Error(`Failed fetchImage: ${error.message}`);
        }
    }
}
