/**
 * 2026 Division of Industrial Design Graduation Show
 * Loading Screen & Page Transition
 */

// ==================== CONFIGURATION ====================
const MINIMUM_LOADING_TIME = 2000; // 2 seconds minimum display time
const LOADING_PHOTO_CYCLE_MS = 500;
const FEATURE_CARD_SLIDESHOW_MS = 1000; // Same interval as teaser.html
const LOADING_SEEN_KEY = 'gradshow2026_loadingSeen';

function hasSeenLoadingThisSession() {
    try {
        return sessionStorage.getItem(LOADING_SEEN_KEY) === '1';
    } catch {
        return false;
    }
}

function markLoadingSeenThisSession() {
    try {
        sessionStorage.setItem(LOADING_SEEN_KEY, '1');
    } catch {
        /* private mode / blocked storage */
    }
}

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
let loadingScreenPhotoIndex = 0;
let photoInterval = null;
let flipCardBgInterval = null;
let flipCardBgPhotoIndex = 0;
let featureCardSlideshowTimer = null;
let featureCardSlideshowIndex = 0;
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

function stopFeatureCardSlideshow() {
    if (featureCardSlideshowTimer != null) {
        clearInterval(featureCardSlideshowTimer);
        featureCardSlideshowTimer = null;
    }
}

function startFeatureCardSlideshow(img) {
    if (!img || loadingPhotos.length <= 1) return;
    stopFeatureCardSlideshow();
    featureCardSlideshowTimer = setInterval(() => {
        featureCardSlideshowIndex =
            (featureCardSlideshowIndex + 1) % loadingPhotos.length;
        applyLoadingPhotoInstant(img, featureCardSlideshowIndex);
    }, FEATURE_CARD_SLIDESHOW_MS);
}

/**
 * Start slideshow on the single 4:3 feature card; pauses while hovering the photos card.
 */
function initFeatureCardSlideshow() {
    const img = document.getElementById('featureCardSlideshow');
    const photosCard = document.querySelector('.feature-card-photos');
    if (!img || loadingPhotos.length === 0) return;

    featureCardSlideshowIndex = 0;
    applyLoadingPhotoInstant(img, featureCardSlideshowIndex);

    if (loadingPhotos.length <= 1) return;

    startFeatureCardSlideshow(img);

    if (photosCard) {
        photosCard.addEventListener('mouseenter', stopFeatureCardSlideshow);
        photosCard.addEventListener('mouseleave', () => startFeatureCardSlideshow(img));
    }
}

/**
 * Random index for loading overlay only (avoid repeating the current image).
 */
function getRandomLoadingPhotoIndex(excludeIndex) {
    if (loadingPhotos.length <= 1) return 0;
    let next;
    do {
        next = Math.floor(Math.random() * loadingPhotos.length);
    } while (next === excludeIndex);
    return next;
}

/**
 * Advance loading overlay (random) and flip-card back during load (sequential, if present).
 */
function changePhoto() {
    if (loadingImage) {
        loadingScreenPhotoIndex = getRandomLoadingPhotoIndex(loadingScreenPhotoIndex);
        applyLoadingPhotoToLoadingScreen(loadingImage, loadingScreenPhotoIndex);
    }
    if (flipCardBackBgImage) {
        currentPhotoIndex = (currentPhotoIndex + 1) % loadingPhotos.length;
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
        if (loadingPhotos.length > 0) {
            loadingScreenPhotoIndex = Math.floor(Math.random() * loadingPhotos.length);
            loadingImage.src = loadingPhotos[loadingScreenPhotoIndex];
        }
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
 * Return visit in same tab: overlay already hidden via html.skip-loading; show main immediately.
 */
function skipLoadingAndShowMain() {
    if (photoInterval) {
        clearInterval(photoInterval);
        photoInterval = null;
    }

    if (loadingOverlay) {
        loadingOverlay.classList.add('fade-out');
    }

    if (mainContent) {
        mainContent.classList.add('visible');
    }

    startFlipCardBackSlideshowAfterReveal();
    requestAnimationFrame(() => scrollToHashTargetAfterReveal());
}

/**
 * Reveal the main content and hide the loading overlay
 */
function revealMainContent() {
    markLoadingSeenThisSession();

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

// ==================== MOBILE SCROLL-REVEAL (hover substitute) ====================

const CLASS_PHOTO_SCROLL_THRESHOLD_PX = 50;
const SCROLL_REVEAL_ACTIVE_CLASS = 'is-scroll-active';

const scrollRevealMobileMq = window.matchMedia('(max-width: 768px)');
const scrollRevealCoarseMq = window.matchMedia('(hover: none) and (pointer: coarse)');

let classPhotoScrollRevealTeardown = null;
let featureCardScrollRevealTeardown = null;

function shouldUseScrollReveal() {
    return scrollRevealMobileMq.matches || scrollRevealCoarseMq.matches;
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
}

function updateClassPhotoScrollReveal(container) {
    const active =
        window.scrollY >= CLASS_PHOTO_SCROLL_THRESHOLD_PX && isElementInViewport(container);
    container.classList.toggle(SCROLL_REVEAL_ACTIVE_CLASS, active);
}

function setupClassPhotoScrollReveal(container) {
    const onUpdate = () => updateClassPhotoScrollReveal(container);

    window.addEventListener('scroll', onUpdate, { passive: true });
    window.addEventListener('resize', onUpdate, { passive: true });
    onUpdate();

    return () => {
        window.removeEventListener('scroll', onUpdate);
        window.removeEventListener('resize', onUpdate);
        container.classList.remove(SCROLL_REVEAL_ACTIVE_CLASS);
    };
}

function setupFeatureCardScrollReveal(card) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                card.classList.toggle(SCROLL_REVEAL_ACTIVE_CLASS, entry.isIntersecting);
            });
        },
        {
            root: null,
            rootMargin: '0px 0px -60% 0px',
            threshold: 0.25,
        }
    );

    observer.observe(card);

    return () => {
        observer.disconnect();
        card.classList.remove(SCROLL_REVEAL_ACTIVE_CLASS);
    };
}

function teardownScrollRevealInteractions() {
    if (classPhotoScrollRevealTeardown) {
        classPhotoScrollRevealTeardown();
        classPhotoScrollRevealTeardown = null;
    }
    if (featureCardScrollRevealTeardown) {
        featureCardScrollRevealTeardown();
        featureCardScrollRevealTeardown = null;
    }
}

function initScrollRevealInteractions() {
    teardownScrollRevealInteractions();

    if (!shouldUseScrollReveal()) return;

    const classPhotoContainer = document.querySelector('.class-photo-container');
    const featureCard = document.querySelector('.feature-card-link');

    if (classPhotoContainer) {
        classPhotoScrollRevealTeardown = setupClassPhotoScrollReveal(classPhotoContainer);
    }
    if (featureCard) {
        featureCardScrollRevealTeardown = setupFeatureCardScrollReveal(featureCard);
    }
}

function initScrollRevealMediaListeners() {
    const onChange = () => initScrollRevealInteractions();
    if (typeof scrollRevealMobileMq.addEventListener === 'function') {
        scrollRevealMobileMq.addEventListener('change', onChange);
        scrollRevealCoarseMq.addEventListener('change', onChange);
    } else {
        scrollRevealMobileMq.addListener(onChange);
        scrollRevealCoarseMq.addListener(onChange);
    }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements after DOM is ready
    loadingImage = document.getElementById('loadingImage');
    flipCardBackBgImage = document.getElementById('flipCardBackBgImage');
    loadingOverlay = document.getElementById('loadingOverlay');
    mainContent = document.getElementById('mainContent');

    preloadImages();
    initFeatureCardSlideshow();

    if (hasSeenLoadingThisSession()) {
        skipLoadingAndShowMain();
    } else {
        initLoadingAnimation();
        initPageTransition();
    }

    // Mobile: scroll-driven hover substitute for class photo + feature card
    initScrollRevealInteractions();
    initScrollRevealMediaListeners();
});
