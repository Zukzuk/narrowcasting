import express from 'express';
import { handleError } from './utils.js';

const router = express.Router();

/**
 * 
https://www.plexopedia.com/plex-media-server/api/
To have Plex return JSON, you simply add the following header to the API request: Accept: application/json
https://cinema.daveloper.nl/identity/?X-Plex-Token=
machineIdentifier="66113111fd251ee1929107218d9b66e228933c1a"
https://cinema.daveloper.nl/library/sections/?X-Plex-Token=
[MediaContainer] 
<Directory key="3" type="movie" title="Animated Movies">
https://cinema.daveloper.nl/library/sections/3/all?X-Plex-Token=
[MediaContainer] 
<Video ratingKey="7036" key="/library/metadata/7036" 
studio="Paramount Pictures" type="movie" title="The Adventures of Tintin" 
viewCount="1" year="2011" thumb="/library/metadata/7036/thumb/1729734864" 
art="/library/metadata/7036/art/1729734864" primaryExtraKey="/library/metadata/7193">
image https://cinema.daveloper.nl/library/metadata/7036/thumb/1729734864?X-Plex-Token=
url https://cinema.daveloper.nl/web/index.html#!/server/66113111fd251ee1929107218d9b66e228933c1a/details?key=/library/metadata/7036
 */

function PlexNarrowcastingApi(models) {
    const {
    } = models;

    /**
     * @openapi
     * /api/plex/covers/random:
     *   get:
     *     tags: 
     *       - plex-narrowcasting
     */
    router.get('/covers/random', async (req, res) => {
        try {
            // Fetch random cover image
        } catch (error) {
            handleError(error, res, "Error fetching random cover image");
        }
    });

    return router;
}

export default PlexNarrowcastingApi;
