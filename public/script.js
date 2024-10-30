
import { calculateMainColor, adjustAspectRatio, toggleVisibility, resetLoaderAnimation } from './utils.js';

let currentImage = 1;
let nextImageDataUrl = null;
let abortController;

async function fetchImageData() {
    // Cancel the previous request if it exists
    if (abortController) abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;

    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 0;
    const apiUrl = new URL('/slideshow/random-book', window.location.origin);
    apiUrl.searchParams.append('page', page);

    try {
        const response = await fetch(apiUrl, { signal });
        if (!response.ok) throw new Error(`Error fetching image: ${response.statusText}`);
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
    return isNaN(timeout) || timeout < 3000 ? 3000 : timeout; // Minimum 5 seconds
}

async function prefetchNextImage() {
    try {
        nextImageDataUrl = await fetchImageData();
    } catch (error) {
        console.error("Error prefetching next image:", error);
    }
}

async function displayNextImage() {
    const { activeImage, inactiveImage } = getActiveAndInactiveImages();
    setImageSource(inactiveImage, nextImageDataUrl);

    inactiveImage.onload = () => {
        adjustAspectRatio(inactiveImage);
        const value = calculateMainColor(inactiveImage);
        resetLoaderAnimation(value, interval);
        prefetchNextImage(); // Start prefetching the next image after displaying the current one
    };

    toggleVisibility(activeImage, inactiveImage);
    currentImage = currentImage === 1 ? 2 : 1;
}

const interval = getTimeoutFromQueryParams();
async function startSlideshow() {
    await prefetchNextImage(); // Prefetch the first image
    displayNextImage(); // Display the first prefetched image
    setInterval(displayNextImage, interval);
}
startSlideshow();
