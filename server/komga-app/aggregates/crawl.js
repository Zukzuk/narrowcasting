const axios = require('axios');
const { fuzzySearch } = require('../utils');
const { CRAWL_PAGE_SIZE, KOMGA_API, KOMGA_AUTH } = require('../config');

const cache = { series: null, collections: null};

function cacheContent(content, type) {
    content.forEach(item => {
        // Save the name by ID in cache
        cache[type][item.id] = item.name; 
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
    if (!cache[type]) {
        try {
            cache[type] = {};
            // Fetch the first page to get the total number of pages
            const firstPageData = await fetch(0, type);
            const totalPages = firstPageData.totalPages;
            // Cache content from the first page
            cacheContent(firstPageData.content, type);
            // Loop to fetch remaining pages
            for (let page = 1; page < totalPages; page++) {
                const { content } = await fetch(page, type);
                cacheContent(content, type);
            }
            console.log(cache[type], `crawled ${totalPages} pages and found ${ Object.entries(cache[type]).length} ${type}...`);
        } catch (error) {
            console.error("Error during crawling and caching of items:", error.message || error);
        }
    }
    return fuzzySearch(cache[type], search);
}

module.exports = crawl;
