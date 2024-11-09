const axios = require('axios');
const { fuzzySearch } = require('../utils');
const { CRAWL_PAGE_SIZE, KOMGA_API, KOMGA_AUTH } = require('../config');

let cache;

function cacheContent(content) {
    content.forEach(item => {
        // Save the name by ID in cache
        cache[item.id] = item.name; 
    });
}

async function fetch(page, type) {
    const url = `${KOMGA_API}/${type}?size=${CRAWL_PAGE_SIZE}&page=${page}`;
    try {
        const response = await axios.get(url, { auth: KOMGA_AUTH });
        return response.data;
    } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message || error);
        throw error;
    }
}

async function crawl(type, search) {
    if (!cache) {
        try {
            cache = {};
            // Fetch the first page to get the total number of pages
            const firstPageData = await fetch(0, type);
            const totalPages = firstPageData.totalPages;
            // Cache content from the first page
            cacheContent(firstPageData.content);
            // Loop to fetch remaining pages
            for (let page = 1; page < totalPages; page++) {
                const { content } = await fetch(page, type);
                cacheContent(content);
            }
            console.log(cache, `crawled ${totalPages} pages and found ${ Object.entries(cache).length} ${type}...`);
        } catch (error) {
            console.error("Error during crawling and caching of items:", error.message || error);
        }
    }
    return fuzzySearch(cache, search);
}

module.exports = crawl;
