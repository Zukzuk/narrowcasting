const { VERSION_TAG } = require('../config');

function version() {
    return VERSION_TAG || 'unknown';
}

module.exports = version;