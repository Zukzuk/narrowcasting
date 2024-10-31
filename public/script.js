
import { calculateLoaderColor, adjustAspectRatio, toggleVisibility, resetLoaderAnimation } from './utils.js';

let currentImage = 1;
let nextImageDataUrl = null;
let abortController;

async function fetchImageData() {
    // Cancel the previous request if it exists
    if (abortController) abortController.abort('Pending image load cancelled by new image load.');
    abortController = new AbortController();
    const { signal } = abortController;

    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 0;
    const apiUrl = new URL('/api/slideshow/random-book', window.location.origin);
    apiUrl.searchParams.append('page', page);

    try {
        const response = await fetch(apiUrl, { signal });
        if (!response.ok) throw new Error(response.statusText);
        // Read the response as a binary Blob
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("Fetch aborted due to a new request.");
            throw error;
        } else {
            console.error("Error fetching image data:", error);
            throw error;
        }
    } finally {
        // Clear the abortController after the request completes
        abortController = null;
    }
}

async function fetchVersion() {
    try {
        const response = await fetch('/api/version');
        if (!response.ok)
            throw new Error('Failed to fetch version');
        return await response.text();
    } catch (error) {
        console.error('Error fetching version:', error);
        return 'unknown'; // Default in case of an error
    }
}

function getActiveAndInactiveImages() {
    const activeImage = document.getElementById(`image${currentImage}`);
    const inactiveImage = document.getElementById(`image${currentImage === 1 ? 2 : 1}`);
    return { activeImage, inactiveImage };
}

function setImageSource(inactiveImage, imageDataUrl) {
    inactiveImage.src = imageDataUrl;
}

function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const timeoutParam = parseInt(urlParams.get('timeout'), 10);
    const interval = isNaN(timeoutParam) || timeoutParam < 3000 ? 3000 : timeoutParam;
    const showVersionParam = urlParams.get('showVersion');
    const showVersion = Boolean(showVersionParam);
    return { interval, showVersion };
}

async function displayNextImage() {
    const { activeImage, inactiveImage } = getActiveAndInactiveImages();
    setImageSource(inactiveImage, nextImageDataUrl);

    inactiveImage.onload = async () => {
        adjustAspectRatio(inactiveImage);
        const value = calculateLoaderColor(inactiveImage);
        resetLoaderAnimation(value, interval);
        nextImageDataUrl = await fetchImageData(); // Start prefetching the next image after displaying the current one
    };

    toggleVisibility(activeImage, inactiveImage);
    currentImage = currentImage === 1 ? 2 : 1;
}

// Check if showVersion is set to true in the query string
function displayVersion() {
    if (showVersion) {
        fetchVersion().then(semver => {
            const versionDisplay = document.getElementById('version-display');
            versionDisplay.innerText = `v${semver}`;
            versionDisplay.style.display = 'block';
        });
    }
}

const { interval, showVersion } = getQueryParams();
async function startSlideshow() {
    displayVersion();
    nextImageDataUrl = await fetchImageData(); // Prefetch the first image
    displayNextImage(); // Display the first prefetched image
    setInterval(displayNextImage, interval);
}
startSlideshow();
