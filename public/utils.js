// Adjust the aspect ratio class based on image orientation
export function adjustAspectRatio(imageElement) {
    if (imageElement.naturalHeight > imageElement.naturalWidth) {
        imageElement.classList.add('portrait');
        imageElement.classList.remove('landscape');
    } else {
        imageElement.classList.add('landscape');
        imageElement.classList.remove('portrait');
    }
}

// Toggle visibility for crossfade effect
export function toggleVisibility(activeImage, inactiveImage) {
    activeImage.classList.remove('visible');
    inactiveImage.classList.add('visible');
}

// Function to reset the loader animation and apply the hue color
export function resetLoaderAnimation(value, interval) {
    const fill = document.querySelector('.progress-bar-fill');
    
    // Apply the hue as the loader color
    fill.style.backgroundColor = `hsl(${rgbToHue(value)}, 70%, 50%)`;
    // fill.style.backgroundColor = `rgb(${value.r},${value.g},${value.b})`;

    // Reset animation
    fill.style.animation = 'none';
    void fill.offsetWidth; // Trigger reflow to restart the animation
    fill.style.animation = `fillBar ${interval / 1000}s linear forwards`;
}

// Calculate the main hue of an image
export function calculateLoaderColor(imageElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
    }
    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);

    return {r, g, b};
}

// Convert RGB to Hue
export function rgbToHue(rgb) {
    let {r, g, b} = rgb;
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let hue;
    if (max === min) {
        hue = 0;
    } else {
        const d = max - min;
        switch (max) {
            case r: hue = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
            case g: hue = ((b - r) / d + 2) * 60; break;
            case b: hue = ((r - g) / d + 4) * 60; break;
        }
    }
    return Math.round(hue);
}
