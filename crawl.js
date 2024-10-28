const axios = require('axios');
require('dotenv').config(); // Load environment variables for auth

// Base URL of the API and caching settings
const PAGE_SIZE = 50;
let cachedCollections = {};  // Map of all collections name/id
// Komga API Configuration
const KOMGA_API = process.env.KOMGA_API_LOCATION;
const KOMGA_AUTH = {
    username: process.env.KOMGA_USERNAME2,
    password: process.env.KOMGA_PASSWORD2
};

async function fetchPage(page) {
    const url = `${KOMGA_API}/collections?size=${PAGE_SIZE}&page=${page}`;
    try {
        const response = await axios.get(url, { auth: KOMGA_AUTH });
        return response.data;
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message || error);
        throw error;
    }
}

async function crawlCollections() {
    function cacheContent(content) {
        content.forEach(item => {
            // Save the name by ID in cachedCollections
            cachedCollections[item.id] = item.name; 
        });
    }

    try {
        // Fetch the first page to get the total number of pages
        const firstPageData = await fetchPage(0);
        const totalPages = firstPageData.totalPages;
        // Cache content from the first page
        cacheContent(firstPageData.content);

        // Loop to fetch remaining pages
        for (let page = 1; page < totalPages; page++) {
            const { content } = await fetchPage(page);
            cacheContent(content);
        }

        console.log(cachedCollections, `crawled ${totalPages} pages and found ${ Object.entries(cachedCollections).length} collections...`);
        return cachedCollections;
    } catch (error) {
        console.error("Error during crawling and caching of collections:", error.message || error);
    }
}

// Export cached data if needed elsewhere in your code
module.exports = crawlCollections;
