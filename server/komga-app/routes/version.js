function version() {
    return process.env.VERSION_TAG || 'unknown';
}

module.exports = version;