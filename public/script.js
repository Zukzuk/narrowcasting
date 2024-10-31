
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

function getActiveAndInactiveImages() {
    const activeImage = document.getElementById(`image${currentImage}`);
    const inactiveImage = document.getElementById(`image${currentImage === 1 ? 2 : 1}`);
    return { activeImage, inactiveImage };
}

function setImageSource(inactiveImage, imageDataUrl) {
    inactiveImage.src = imageDataUrl;
}

function getTimeoutFromQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const timeout = parseInt(urlParams.get('timeout'), 10);
    return isNaN(timeout) || timeout < 3000 ? 3000 : timeout;
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

const interval = getTimeoutFromQueryParams();
async function startSlideshow() {
    nextImageDataUrl = await fetchImageData(); // Prefetch the first image
    displayNextImage(); // Display the first prefetched image
    setInterval(displayNextImage, interval);
}
startSlideshow();
