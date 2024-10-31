
import { calculateLoaderColor, adjustAspectRatio, toggleVisibility, resetLoaderAnimation } from './utils.js';

let currentImage = 1;
let nextImageDataUrl = null;
let abortController;
let wakeLock = null;

async function fetchImageData(page, interval) {
    // Cancel the previous request if it exists
    if (abortController) abortController.abort('Pending image load cancelled by new image load.');
    abortController = new AbortController();
    const { signal } = abortController;

    // Setup API url and params
    const apiUrl = new URL('/api/slideshow/random-book', window.location.origin);
    apiUrl.searchParams.append('page', page);
    apiUrl.searchParams.append('interval', interval);

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

function setImageSource(inactiveImage, imageDataUrl) {
    inactiveImage.src = imageDataUrl;
}

function getActiveAndInactiveImages() {
    const activeImage = document.getElementById(`image${currentImage}`);
    const inactiveImage = document.getElementById(`image${currentImage === 1 ? 2 : 1}`);
    return { activeImage, inactiveImage };
}

async function displayNextImage(page, interval) {
    const { activeImage, inactiveImage } = getActiveAndInactiveImages();
    setImageSource(inactiveImage, nextImageDataUrl);

    // Start prefetching the next image after displaying the current one
    inactiveImage.onload = async () => {
        adjustAspectRatio(inactiveImage);
        const value = calculateLoaderColor(inactiveImage);
        resetLoaderAnimation(value, interval);
        nextImageDataUrl = await fetchImageData(page, interval);
    };

    toggleVisibility(activeImage, inactiveImage);
    currentImage = currentImage === 1 ? 2 : 1;
}

async function fetchVersion() {
    try {
        // Setup API url and params
        const apiUrl = new URL('/api/version', window.location.origin);
        const response = await fetch(apiUrl);
        if (!response.ok)
            throw new Error('Failed to fetch version');
        return await response.text();
    } catch (error) {
        console.error('Error fetching version:', error);
        return 'unknown'; // Default in case of an error
    }
}

function displayVersion(showVersion) {
    if (showVersion) {
        fetchVersion().then(semver => {
            const versionDisplay = document.getElementById('version-display');
            versionDisplay.innerText = `v${semver}`;
            versionDisplay.style.display = 'block';
        });
    }
}

function getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = parseInt(urlParams.get('page'), 10);
    const page = isNaN(pageParam) || pageParam < 0 ? 0 : pageParam;
    const intervalParam = parseInt(urlParams.get('interval'), 10);
    const interval = isNaN(intervalParam) ? 10 : intervalParam < 3 ? 3 : intervalParam;
    const showVersionParam = urlParams.get('showVersion');
    const showVersion = showVersionParam === 'true' ? true : false;
    return { interval: interval*1000, showVersion, page };
}

async function startSlideshow() {
    const { page, interval, showVersion } = getQueryParams();
    displayVersion(showVersion);
    // Prefetch the first image
    nextImageDataUrl = await fetchImageData(page, interval); 
    // Display the first fetched image
    displayNextImage(page, interval); 
    // Pass params explicitly
    setInterval(() => displayNextImage(page, interval), interval);
}
startSlideshow();

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock released');
        });
        console.log('Wake Lock is active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}
requestWakeLock();
document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});

const fullscreenButton = document.getElementById('fullscreen-button');
fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        // Request fullscreen mode for the document's root element
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
        });
    } else {
        // Exit fullscreen mode
        document.exitFullscreen();
    }
});
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenButton.textContent = '[x]';
    } else {
        fullscreenButton.textContent = '[ ]';
    }
});

