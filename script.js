/**
 * 2026 Division of Industrial Design Graduation Show
 * Loading Screen & Page Transition
 */

// ==================== CONFIGURATION ====================
const MINIMUM_LOADING_TIME = 2000; // 2 seconds minimum display time
const LOADING_PHOTO_CYCLE_MS = 500;
const FEATURE_CARD_SLIDESHOW_MS = 1000; // Same interval as teaser.html

// ==================== LOADING PHOTOS ====================
const loadingPhotos = [
    'loadingPhotos/DSCF0375.JPG',
    'loadingPhotos/DSCF0384.JPG',
    'loadingPhotos/DSCF0403.JPG',
    'loadingPhotos/IMG_2428.jpg',
    'loadingPhotos/IMG_2736.jpg',
    'loadingPhotos/IMG_2739.jpg',
    'loadingPhotos/IMG_9734.jpg',
    'loadingPhotos/IMG_9773.jpg',
    'loadingPhotos/IMG_9827.jpg',
    'loadingPhotos/photo_2025-12-12_17-57-37.jpg',
    'loadingPhotos/photo_2025-12-18_17-40-52.jpg',
    'loadingPhotos/photo_2025-12-18_17-40-53.jpg',
    'loadingPhotos/photo_2026-01-14_15-43-44.jpg',
    'loadingPhotos/PXL_20260108_044359167.MP.jpg',
    'loadingPhotos/PXL_20260108_044505748.MP.jpg',
    'loadingPhotos/PXL_20260108_044735494.MP.jpg',
    'loadingPhotos/PXL_20260314_091902696.MP.jpg',
    'loadingPhotos/Screenshot 2026-02-26 154921.png',
];

// ==================== STATE ====================
let currentPhotoIndex = 0;
let photoInterval = null;
let flipCardBgInterval = null;
let flipCardBgPhotoIndex = 0;
let featureCardSlideshowTimer = null;
let pageLoaded = false;
let minimumTimePassed = false;

// ==================== DOM ELEMENTS ====================
// These will be set after DOM is ready
let loadingImage = null;
let flipCardBackBgImage = null;
let loadingOverlay = null;
let mainContent = null;

// ==================== LOADING PHOTO FUNCTIONS ====================

/**
 * Preload gallery images so swaps can decode quickly.
 */
function preloadImages() {
    loadingPhotos.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

/**
 * Loading overlay: fade / scale between photos (same feel as before).
 */
function applyLoadingPhotoToLoadingScreen(img, index) {
    if (!img) return;
    const t = 'opacity 0.15s ease, transform 0.15s ease';
    img.style.transition = t;
    img.style.opacity = '0';
    img.style.transform = 'scale(0.98)';

    setTimeout(() => {
        img.src = loadingPhotos[index];
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }, 150);
}

/**
 * Flip card back only: instant swap, no motion between frames.
 */
function applyLoadingPhotoToFlipCard(img, index) {
    if (!img) return;
    img.style.transition = 'none';
    img.style.opacity = '';
    img.style.transform = '';
    img.src = loadingPhotos[index];
}

/**
 * 4:3 feature card: instant swap through loadingPhotos (same as teaser.html).
 */
function applyLoadingPhotoInstant(img, index) {
    if (!img) return;
    img.src = loadingPhotos[index];
}

/**
 * Start slideshow on the single 4:3 feature card.
 */
function initFeatureCardSlideshow() {
    const img = document.getElementById('featureCardSlideshow');
    if (!img || loadingPhotos.length === 0) return;

    let index = 0;
    applyLoadingPhotoInstant(img, index);

    if (loadingPhotos.length <= 1) return;

    featureCardSlideshowTimer = setInterval(() => {
        index = (index + 1) % loadingPhotos.length;
        applyLoadingPhotoInstant(img, index);
    }, FEATURE_CARD_SLIDESHOW_MS);
}

/**
 * Advance slideshow index and update loading screen + flip-card back (if present).
 */
function changePhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % loadingPhotos.length;

    if (loadingImage) {
        applyLoadingPhotoToLoadingScreen(loadingImage, currentPhotoIndex);
    }
    if (flipCardBackBgImage) {
        applyLoadingPhotoToFlipCard(flipCardBackBgImage, currentPhotoIndex);
    }
}

/**
 * After the overlay hides, keep cycling only on the flip-card background (same timing as loading).
 */
function startFlipCardBackSlideshowAfterReveal() {
    if (!flipCardBackBgImage) return;

    if (flipCardBgInterval) {
        clearInterval(flipCardBgInterval);
        flipCardBgInterval = null;
    }

    flipCardBgPhotoIndex = currentPhotoIndex;
    applyLoadingPhotoToFlipCard(flipCardBackBgImage, flipCardBgPhotoIndex);

    flipCardBgInterval = setInterval(() => {
        flipCardBgPhotoIndex = (flipCardBgPhotoIndex + 1) % loadingPhotos.length;
        applyLoadingPhotoToFlipCard(flipCardBackBgImage, flipCardBgPhotoIndex);
    }, LOADING_PHOTO_CYCLE_MS);
}

/**
 * Initialize the loading screen photo animation
 */
function initLoadingAnimation() {
    preloadImages();
    if (loadingImage) {
        loadingImage.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    }
    if (flipCardBackBgImage) {
        flipCardBackBgImage.style.transition = 'none';
    }
    photoInterval = setInterval(changePhoto, LOADING_PHOTO_CYCLE_MS);
}

// ==================== PAGE TRANSITION FUNCTIONS ====================

/**
 * After loading overlay hides, scroll to hash target so offset + smooth scroll apply
 * (initial fragment scroll can run before main content is visible).
 */
function scrollToHashTargetAfterReveal() {
    if (window.location.hash !== '#graduates-grid-section') return;
    const el = document.getElementById('graduates-grid-section');
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.dispatchEvent(new Event('scroll'));
}

/**
 * Reveal the main content and hide the loading overlay
 */
function revealMainContent() {
    if (photoInterval) {
        clearInterval(photoInterval);
        photoInterval = null;
    }

    startFlipCardBackSlideshowAfterReveal();

    let hashScrollAfterRevealDone = false;
    const runHashScrollOnceAfterReveal = () => {
        if (hashScrollAfterRevealDone) return;
        hashScrollAfterRevealDone = true;
        requestAnimationFrame(() => scrollToHashTargetAfterReveal());
    };

    // Fade out loading overlay
    if (loadingOverlay) {
        loadingOverlay.addEventListener(
            'transitionend',
            (event) => {
                if (event.propertyName !== 'opacity') return;
                runHashScrollOnceAfterReveal();
            },
            { once: true }
        );
        loadingOverlay.classList.add('fade-out');
        // Fallback if transitionend does not fire (e.g. zero-duration transitions)
        setTimeout(runHashScrollOnceAfterReveal, 700);
    } else {
        runHashScrollOnceAfterReveal();
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
    flipCardBackBgImage = document.getElementById('flipCardBackBgImage');
    loadingOverlay = document.getElementById('loadingOverlay');
    mainContent = document.getElementById('mainContent');
    
    // Start loading animation
    initLoadingAnimation();

    // 4:3 feature card: cycle loadingPhotos (teaser-style instant swap)
    initFeatureCardSlideshow();
    
    // Initialize page transition
    initPageTransition();
});
