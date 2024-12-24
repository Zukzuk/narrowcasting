import axios from 'axios';
import { UrlError } from '../../../utils.js';
import { TMediaType } from '../../shared/types/index.js';

export interface IPlexMediaSections {
    key: string,
    title: TMediaType,
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
        private PLEX_API: string,
        private PLEX_API_KEY: string,
    ) {}

    fetchSections = async (): Promise<IPlexMediaSections[]> => {
        const url = `${this.PLEX_API}/library/sections`;
        try {
            const response = await axios.get(url, {
                params: { 'X-Plex-Token': this.PLEX_API_KEY },
                headers: { Accept: 'application/json' },
            });
            if (!response.data) throw new Error("No sections found.");
            return response.data.MediaContainer.Directory;
        } catch (error: any) {
            throw new UrlError(`Failed fetchSections: ${error.message}`, url);
        }
    }

    fetchSectionMedia = async (mediaType: TMediaType, movieKey: string): Promise<IPlexMediaContainer[]> => {
        const url = `${this.PLEX_API}/library/sections/${movieKey}/${mediaType === 'audiobooks' ? 'albums' : 'all'}`;
        try {
            const response = await axios.get(url, {
                params: { 'X-Plex-Token': this.PLEX_API_KEY },
                headers: { Accept: 'application/json' },
            });
            if (!response.data) throw new Error("No media found.");
            return response.data.MediaContainer.Metadata;
        } catch (error: any) {
            throw new UrlError(`Failed fetchSectionMedia: ${error.message}`, url);
        }
    }

    fetchImage = async (
        thumb: string,
        interval: number,
        startTime: number,
        retryCount: number
    ): Promise<Buffer | "RETRY"> => {
        const url = `${this.PLEX_API}${thumb}`;
        try {
            const image = await axios.get(url, {
                params: { 'X-Plex-Token': this.PLEX_API_KEY },
                responseType: 'arraybuffer',
            });
            if (!image.data) throw new Error("No image found.");
            return Buffer.from(image.data);
        } catch (error: any) {
            throw new UrlError(`Failed fetchImage: ${error.message}`, url);
        }
    }
}
