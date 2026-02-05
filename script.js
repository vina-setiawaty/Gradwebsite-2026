/**
 * 2026 Division of Industrial Design Graduation Show
 * Loading Screen & Page Transition
 */

// ==================== CONFIGURATION ====================
const MINIMUM_LOADING_TIME = 2000; // 2 seconds minimum display time

// ==================== LOADING PHOTOS ====================
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

// ==================== STATE ====================
let currentPhotoIndex = 0;
let photoInterval = null;
let pageLoaded = false;
let minimumTimePassed = false;

// ==================== DOM ELEMENTS ====================
// These will be set after DOM is ready
let loadingImage = null;
let loadingOverlay = null;
let mainContent = null;

// ==================== LOADING PHOTO FUNCTIONS ====================

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
    currentPhotoIndex = (currentPhotoIndex + 1) % loadingPhotos.length;
    
    if (loadingImage) {
        loadingImage.style.opacity = '0';
        loadingImage.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            loadingImage.src = loadingPhotos[currentPhotoIndex];
            loadingImage.style.opacity = '1';
            loadingImage.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Initialize the loading screen photo animation
 */
function initLoadingAnimation() {
    preloadImages();
    if (loadingImage) {
        loadingImage.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    }
    photoInterval = setInterval(changePhoto, 500);
}

// ==================== PAGE TRANSITION FUNCTIONS ====================

/**
 * Reveal the main content and hide the loading overlay
 */
function revealMainContent() {
    // Stop the photo cycling
    if (photoInterval) {
        clearInterval(photoInterval);
        photoInterval = null;
    }
    
    // Fade out loading overlay
    if (loadingOverlay) {
        loadingOverlay.classList.add('fade-out');
    }
    
    // Show main content
    if (mainContent) {
        mainContent.classList.add('visible');
    }
}

/**
 * Check if both conditions are met to reveal main content
 */
function checkReadyToReveal() {
    if (pageLoaded && minimumTimePassed) {
        revealMainContent();
    }
}

/**
 * Initialize the page load detection
 */
function initPageTransition() {
    // Condition 1: Minimum loading time (2 seconds)
    setTimeout(() => {
        minimumTimePassed = true;
        checkReadyToReveal();
    }, MINIMUM_LOADING_TIME);
    
    // Condition 2: All page resources loaded
    window.addEventListener('load', () => {
        pageLoaded = true;
        checkReadyToReveal();
    });
    
    // Fallback: Force reveal after maximum wait time (5 seconds)
    // This ensures the loading screen disappears even if some resources fail to load
    setTimeout(() => {
        if (!pageLoaded) {
            console.warn('Page load timeout - forcing reveal');
            pageLoaded = true;
            checkReadyToReveal();
        }
    }, 5000);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements after DOM is ready
    loadingImage = document.getElementById('loadingImage');
    loadingOverlay = document.getElementById('loadingOverlay');
    mainContent = document.getElementById('mainContent');
    
    // Start loading animation
    initLoadingAnimation();
    
    // Initialize page transition
    initPageTransition();
});
