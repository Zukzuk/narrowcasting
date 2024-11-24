import express from 'express';
import { handleError } from '../../helpers.js';

const router = express.Router();

/**
 * 
https://www.plexopedia.com/plex-media-server/api/
To have Plex return JSON, you simply add the following header to the API request: Accept: application/json
https://cinema.daveloper.nl/identity/?X-Plex-Token=PLEX_API_KEY
machineIdentifier="xxx"
https://cinema.daveloper.nl/library/sections/?X-Plex-Token=PLEX_API_KEY
[MediaContainer] 
<Directory key="3" type="movie" title="Animated Movies">
https://cinema.daveloper.nl/library/sections/3/all?X-Plex-Token=PLEX_API_KEY
[MediaContainer] 
<Video ratingKey="7036" key="/library/metadata/7036" 
studio="Paramount Pictures" type="movie" title="The Adventures of Tintin" 
viewCount="1" year="2011" thumb="/library/metadata/7036/thumb/1729734864" 
art="/library/metadata/7036/art/1729734864" primaryExtraKey="/library/metadata/7193">
image https://cinema.daveloper.nl/library/metadata/7036/thumb/1729734864?X-Plex-Token=PLEX_API_KEY
url https://cinema.daveloper.nl/web/index.html#!/server/PLEX_MACHINE_DENTIFIER/details?key=/library/metadata/7036
 */

export default function MoviesNarrowcastingApi(models: any) {
    const {
    } = models;

    /**
     * @openapi
     * /api/movies/covers/random:
     *   get:
     *     tags: 
     *       - movies-narrowcasting
     */
    router.get('/covers/random', async (req: any, res: any) => {
        try {
            // Fetch random cover image
        } catch (error: any) {
            handleError(error, res, "Error fetching random cover image");
        }
    });

    return router;
}
