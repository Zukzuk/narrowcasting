const { jaroWinkler } = require('@skyra/jaro-winkler');

// Shuffle array elements
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Error handling helper
function handleError(error, res, message) {
    console.error(message, error.message || error);
    res.status(500).json({ error: message });
}

// Fuzzy search
function fuzzySearch(cache, search) {
    if (!search) return cache;
    return cache.filter(
        item => jaroWinkler(search, item, { caseSensitive: false }) >= 0.8
    );
}

module.exports = {
    shuffleArray,
    handleError,
    fuzzySearch,
};
