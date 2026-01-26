/**
 * 2026 Division of Industrial Design Graduation Show
 * Loading Screen Image Animation
 */

// Array of loading photos to cycle through
const loadingPhotos = [
    'assets/loadingPhotos/breakaway 2.jpg',
    'assets/loadingPhotos/Collage 15.jpg',
    'assets/loadingPhotos/Collage 17.jpg',
    'assets/loadingPhotos/Collage 19.jpg',
    'assets/loadingPhotos/Collage 23.jpg',
    'assets/loadingPhotos/Collage 7.jpg',
    'assets/loadingPhotos/conclusion.jpg',
    'assets/loadingPhotos/landing-page-slides-photo-1.png',
    'assets/loadingPhotos/making maker.jpg',
    'assets/loadingPhotos/moments.jpg',
    'assets/loadingPhotos/preface.jpg',
    'assets/loadingPhotos/space.jpg',
    'assets/loadingPhotos/spread studio shot.jpg',
    'assets/loadingPhotos/table.jpg',
    'assets/loadingPhotos/tension.jpg'
];

// Current photo index
let currentPhotoIndex = 0;

// Get the loading image element
const loadingImage = document.getElementById('loadingImage');

/**
 * Preload all images for smoother transitions
 */
function preloadImages() {
    loadingPhotos.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

/**
 * Change to the next photo with animation
 */
function changePhoto() {
    // Move to next photo (loop back to start if at end)
    currentPhotoIndex = (currentPhotoIndex + 1) % loadingPhotos.length;
    
    // Apply fade out effect
    loadingImage.style.opacity = '0';
    loadingImage.style.transform = 'scale(0.98)';
    
    // After fade out, change image and fade in
    setTimeout(() => {
        loadingImage.src = loadingPhotos[currentPhotoIndex];
        loadingImage.style.opacity = '1';
        loadingImage.style.transform = 'scale(1)';
    }, 300);
}

/**
 * Initialize the loading screen animation
 */
function initLoadingAnimation() {
    // Preload images for smoother experience
    preloadImages();
    
    // Add transition styles to the image
    loadingImage.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    // Change photo every 2.5 seconds
    setInterval(changePhoto, 2500);
}

// Start animation when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initLoadingAnimation);

