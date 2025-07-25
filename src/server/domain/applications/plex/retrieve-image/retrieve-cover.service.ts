import axios from 'axios';
import { UrlError } from '../../../../utils.js';
import { TMediaType } from '../../../types/index.js';
import { PLEX_API, PLEX_API_KEY } from '../../../../config.js';

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

/**
 * Service to fetch media cover images from a Plex server.
 * 
 * @class RetrieveCoverService
 */
export default class RetrieveCoverService {

    constructor() { }

    /**
     * Fetches the sections from the Plex server.
     * 
     * @returns {Promise<IPlexMediaSections[]>}
     */
    fetchSections = async (): Promise<IPlexMediaSections[]> => {
        const url = `${PLEX_API}/library/sections`;
        try {
            const response = await axios.get(url, {
                params: { 'X-Plex-Token': PLEX_API_KEY },
                headers: { Accept: 'application/json' },
            });
            if (!response.data) throw new Error("No sections found.");
            return response.data.MediaContainer.Directory;
        } catch (error: any) {
            throw new UrlError(`Failed fetchSections: ${error.message}`, url);
        }
    }

    /**
     * Fetches the seasons for a given show.
     * 
     * @param {string} showRatingKey
     * @returns {Promise<IPlexMediaContainer[]>}
     */
    fetchSeasons = async (showRatingKey: string): Promise<IPlexMediaContainer[]> => {
        const url = `${PLEX_API}/library/metadata/${showRatingKey}/children`;
        try {
            const response = await axios.get(url, {
                params: { 'X-Plex-Token': PLEX_API_KEY },
                headers: { Accept: 'application/json' },
            });
            if (!response.data) throw new Error("No seasons found.");
            return response.data.MediaContainer.Metadata;
        } catch (error: any) {
            throw new UrlError(`Failed fetchSeasons: ${error.message}`, url);
        }
    }

    /**
     * Fetches the media data from a given section.
     * For 'series' and 'animated-series', also includes seasons.
     * 
     * @param {TMediaType} mediaType
     * @param {string} sectionKey
     * @returns {Promise<IPlexMediaContainer[]>}
     */
    fetchMediaData = async (mediaType: TMediaType, sectionKey: string): Promise<IPlexMediaContainer[]> => {
        const url = `${PLEX_API}/library/sections/${sectionKey}/${mediaType === 'audiobooks' ? 'albums' : 'all'}`;
        try {
            const response = await axios.get(url, {
                params: { 'X-Plex-Token': PLEX_API_KEY },
                headers: { Accept: 'application/json' },
            });
            if (!response.data) throw new Error("No media found.");

            const metadata: IPlexMediaContainer[] = response.data.MediaContainer.Metadata;

            // If series or animated-series, fetch seasons and append to result
            if (mediaType === 'series' || mediaType === 'animated-series') {
                const seasonDataArrays = await Promise.all(metadata.map(async show => {
                    try {
                        const seasons = await this.fetchSeasons(show.ratingKey);
                        return seasons;
                    } catch (err) {
                        console.warn(`Warning: could not fetch seasons for ${show.title}: ${err}`);
                        return [];
                    }
                }));
                const seasons = seasonDataArrays.flat();
                metadata.push(...seasons); // Add seasons into the media array
            }

            return metadata;
        } catch (error: any) {
            throw new UrlError(`Failed fetchSectionMedia: ${error.message}`, url);
        }
    }

    /**
     * Fetches the image from a given thumb URL.
     * 
     * @param {string} thumb
     * @returns {Promise<Buffer>}
     */
    fetchImage = async (thumb: string): Promise<Buffer> => {
        const url = `${PLEX_API}${thumb}`;
        try {
            const image = await axios.get(url, {
                params: { 'X-Plex-Token': PLEX_API_KEY },
                responseType: 'arraybuffer',
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
