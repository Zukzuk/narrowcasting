import {
    calculateLoaderColor,
    adjustAspectRatio,
    toggleVisibility,
    resetLoaderAnimation
} from './utils.js';

let currentImage = 1;
let nextImageData = null;
let wakeLock = null;

function setImageSource(inactiveImage, imageData) {
    const parent = inactiveImage.parentElement;
    parent.href = imageData.imageUrl;
    inactiveImage.src = URL.createObjectURL(imageData.blob);
}

function getActiveAndInactiveImages() {
    const activeImage = document.getElementById(`image${currentImage}`);
    const inactiveImage = document.getElementById(`image${currentImage === 1 ? 2 : 1}`);
    return { activeImage, inactiveImage };
}

async function fetchVersion() {
    try {
        const response = await fetch(new URL('/api/version', window.location.origin));
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
    return { interval: interval * 1000, showVersion, page };
}

const fullscreenButton = document.getElementById('fullscreen-button');
fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        // Request fullscreen mode for the document's root element
        document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) fullscreenButton.textContent = '[x]';
    else fullscreenButton.textContent = '[ ]';
});

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => console.log('Wake Lock released'));
        console.log('Wake Lock is active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}
document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible') requestWakeLock();
});

async function commandRetrieveImage(page, interval) {
    const url = new URL('/api/comics/pages/random', window.location.origin);
    url.searchParams.append('page', page);
    url.searchParams.append('interval', interval);

    try {
        return await fetch(url, { method: 'POST' });
    } catch (error) {
        console.error('Error fetching image:', error);
    }
}

async function queryImage() {
    const url = new URL('/api/images', window.location.origin);

    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const imageUrl = response.headers.get('X-Custom-Image-URL');
        return { blob, imageUrl };
    } catch (error) {
        console.error('Error fetching image:', error);
    }
}

async function displayNextImage(page, interval) {
    const { activeImage, inactiveImage } = getActiveAndInactiveImages();
    nextImageData = await queryImage();
    commandRetrieveImage(page, interval);
    setImageSource(inactiveImage, nextImageData);
    inactiveImage.onload = async () => {
        adjustAspectRatio(inactiveImage);
        const value = calculateLoaderColor(inactiveImage);
        resetLoaderAnimation(value, interval);
    };
    toggleVisibility(activeImage, inactiveImage);
    currentImage = currentImage === 1 ? 2 : 1;
}

async function narrowcasting() {
    requestWakeLock();
    const { page, interval, showVersion } = getQueryParams();
    displayVersion(showVersion);

    // Command retrieval of the first image
    await commandRetrieveImage(page, interval);
    // Display the first fetched image
    setTimeout(() => {
        displayNextImage(page, interval)
        // Set interval to display the next images
        setInterval(() => displayNextImage(page, interval), interval);
    }, 3000);
}
narrowcasting();

