/**
 * 2026 Division of Industrial Design Graduation Show
 * Interactive Background Canvas & Loading Screen Animation
 */

/* ==========================================
 * INTERACTIVE BACKGROUND CANVAS
 * ========================================== */

const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

// Mouse position tracking
let mouseX = -1000;
let mouseY = -1000;

// Grid configuration
const GRID_SPACING = 30; // Distance between circles
const CIRCLE_OFFSET = 12; // Maximum distance circles can move toward mouse
const CIRCLE_SIZE = 2; // Circle radius
const CIRCLE_COLOR = '#d0d0d0'; // Light grey

/**
 * Set canvas size to match window dimensions
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Update mouse position
 */
function updateMousePosition(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

/**
 * Calculate attracted position for a point
 */
function getAttractedPosition(px, py, distance) {
    const dx = mouseX - px;
    const dy = mouseY - py;
    const angle = Math.atan2(dy, dx);
    
    return {
        x: px + distance * Math.cos(angle),
        y: py + distance * Math.sin(angle)
    };
}

/**
 * Main animation loop
 */
function animate() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0'; // Match body background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate grid dimensions
    const cols = Math.ceil(canvas.width / GRID_SPACING) + 1;
    const rows = Math.ceil(canvas.height / GRID_SPACING) + 1;
    
    // Draw grid of circles
    ctx.fillStyle = CIRCLE_COLOR;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const px = col * GRID_SPACING;
            const py = row * GRID_SPACING;
            
            // Get attracted position
            const pos = getAttractedPosition(px, py, CIRCLE_OFFSET);
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, CIRCLE_SIZE, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    requestAnimationFrame(animate);
}

/**
 * Initialize interactive canvas
 */
function initCanvas() {
    resizeCanvas();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', updateMousePosition);
    
    // Start animation
    animate();
}

/* ==========================================
 * LOADING SCREEN IMAGE ANIMATION
 * ========================================== */

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

// Start both animations when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initLoadingAnimation();
});

