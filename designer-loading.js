/**
 * Designer profile page — loading overlay until page assets are ready.
 * Requires: data.js, graduates.js, designer.js
 */

const DESIGNER_MINIMUM_LOADING_TIME = 0;
const DESIGNER_MAX_LOADING_WAIT_MS = 8000;
const DESIGNER_LOADING_PHOTO_CYCLE_MS = 500;

const designerLoadingPhotos = [
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

let designerLoadingScreenPhotoIndex = 0;
let designerPhotoInterval = null;
let designerPageLoaded = false;
let designerMinimumTimePassed = false;
let designerAssetsLoaded = false;

function applyDesignerLoadingPhoto(img, index) {
    if (!img) return;
    const t = 'opacity 0.15s ease, transform 0.15s ease';
    img.style.transition = t;
    img.style.opacity = '0';
    img.style.transform = 'scale(0.98)';

    setTimeout(() => {
        img.src = designerLoadingPhotos[index];
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }, 150);
}

function getRandomDesignerLoadingPhotoIndex(excludeIndex) {
    if (designerLoadingPhotos.length <= 1) return 0;
    let next;
    do {
        next = Math.floor(Math.random() * designerLoadingPhotos.length);
    } while (next === excludeIndex);
    return next;
}

function changeDesignerLoadingPhoto() {
    const img = document.getElementById('designerLoadingImage');
    if (!img) return;
    designerLoadingScreenPhotoIndex = getRandomDesignerLoadingPhotoIndex(designerLoadingScreenPhotoIndex);
    applyDesignerLoadingPhoto(img, designerLoadingScreenPhotoIndex);
}

function preloadDesignerLoadingScreenPhotos() {
    return Promise.all(
        designerLoadingPhotos.map(
            (src) =>
                new Promise((resolve) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = resolve;
                    img.src = src;
                })
        )
    );
}

function initDesignerLoadingAnimation() {
    const img = document.getElementById('designerLoadingImage');
    if (!img || designerLoadingPhotos.length === 0) return;

    img.classList.add('loading-slideshow-active');
    img.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    designerLoadingScreenPhotoIndex = Math.floor(Math.random() * designerLoadingPhotos.length);
    img.src = designerLoadingPhotos[designerLoadingScreenPhotoIndex];

    if (designerPhotoInterval) {
        clearInterval(designerPhotoInterval);
        designerPhotoInterval = null;
    }
    designerPhotoInterval = setInterval(changeDesignerLoadingPhoto, DESIGNER_LOADING_PHOTO_CYCLE_MS);
    preloadDesignerLoadingScreenPhotos();
}

function revealDesignerMainContent() {
    const overlay = document.getElementById('designerLoadingOverlay');
    const mainContent = document.getElementById('mainContent');

    if (designerPhotoInterval) {
        clearInterval(designerPhotoInterval);
        designerPhotoInterval = null;
    }

    if (overlay) {
        overlay.classList.add('fade-out');
    }
    if (mainContent) {
        mainContent.classList.add('visible');
    }
}

function checkDesignerReadyToReveal() {
    if (designerPageLoaded && designerMinimumTimePassed && designerAssetsLoaded) {
        revealDesignerMainContent();
    }
}

function initDesignerPageAssetPreload() {
    if (
        typeof getDesignerPagePreloadContext !== 'function' ||
        typeof collectDesignerPageImageUrls !== 'function' ||
        typeof preloadGraduateCardImages !== 'function'
    ) {
        designerAssetsLoaded = true;
        return;
    }

    const { record, otherDesigners } = getDesignerPagePreloadContext();
    const urls = collectDesignerPageImageUrls(record, otherDesigners);
    preloadGraduateCardImages(urls, { concurrency: 6 }).then(() => {
        designerAssetsLoaded = true;
        checkDesignerReadyToReveal();
    });
}

function initDesignerPageTransition() {
    setTimeout(() => {
        designerMinimumTimePassed = true;
        checkDesignerReadyToReveal();
    }, DESIGNER_MINIMUM_LOADING_TIME);

    window.addEventListener('load', () => {
        designerPageLoaded = true;
        checkDesignerReadyToReveal();
    });

    setTimeout(() => {
        if (!designerPageLoaded || !designerAssetsLoaded) {
            console.warn('Designer page loading timeout — revealing content');
            designerPageLoaded = true;
            designerAssetsLoaded = true;
            checkDesignerReadyToReveal();
        }
    }, DESIGNER_MAX_LOADING_WAIT_MS);
}

function shouldSkipDesignerLoading() {
    try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    } catch {
        /* ignore */
    }
    return false;
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.documentElement.dataset.page !== 'designer') return;

    const mainContent = document.getElementById('mainContent');
    const overlay = document.getElementById('designerLoadingOverlay');

    if (typeof loadDesignerData !== 'function') {
        if (mainContent) mainContent.classList.add('visible');
        if (overlay) overlay.classList.add('fade-out');
        return;
    }

    if (shouldSkipDesignerLoading()) {
        loadDesignerData({ eagerImages: true });
        if (mainContent) mainContent.classList.add('visible');
        if (overlay) overlay.classList.add('fade-out');
        return;
    }

    initDesignerLoadingAnimation();
    initDesignerPageTransition();

    setTimeout(() => {
        loadDesignerData({ eagerImages: true });
        initDesignerPageAssetPreload();
    }, 0);
});
