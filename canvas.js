/**
 * Canvas Background Animation
 * Interactive dot grid that follows mouse position
 * Based on p5.js effect - points attracted to cursor
 */

(function() {
    // Configuration
    const CONFIG = {
        gridSpacing: 30,      // Space between grid points
        attractDistance: 10,  // How far dots move toward mouse
        dotSize: 3,           // Size of each dot
        dotColor: 'lightgrey' // Color of dots
    };

    let canvas, ctx;
    let mouseX = 0;
    let mouseY = 0;
    let animationId;
    let isRunning = false;

    // Initialize canvas
    function initCanvas() {
        canvas = document.getElementById('backgroundCanvas');
        if (!canvas) {
            // Create canvas if it doesn't exist
            canvas = document.createElement('canvas');
            canvas.id = 'backgroundCanvas';
            document.body.insertBefore(canvas, document.body.firstChild);
        }

        ctx = canvas.getContext('2d');
        resizeCanvas();
        
        // Set initial mouse position to center
        mouseX = canvas.width / 2;
        mouseY = canvas.height / 2;
    }

    // Resize canvas to fill window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Draw a point attracted to the mouse
    function pointAttract(px, py, d) {
        const angle = Math.atan2(mouseY - py, mouseX - px);
        const x2 = px + d * Math.cos(angle);
        const y2 = py + d * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x2, y2, CONFIG.dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.dotColor;
        ctx.fill();
    }

    // Main draw function
    function draw() {
        // Clear canvas with white background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate number of rows and columns needed
        const cols = Math.ceil(canvas.width / CONFIG.gridSpacing) + 1;
        const rows = Math.ceil(canvas.height / CONFIG.gridSpacing) + 1;

        // Draw grid of attracted points
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const px = col * CONFIG.gridSpacing;
                const py = row * CONFIG.gridSpacing;
                pointAttract(px, py, CONFIG.attractDistance);
            }
        }
    }

    // Animation loop
    function animate() {
        if (!isRunning) return;
        draw();
        animationId = requestAnimationFrame(animate);
    }

    // Start animation
    function start() {
        if (isRunning) return;
        isRunning = true;
        animate();
    }

    // Stop animation
    function stop() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }

    // Handle mouse movement
    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    // Handle touch movement (for mobile)
    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    }

    // Handle visibility change (pause when tab not visible)
    function handleVisibilityChange() {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    }

    // Initialize when DOM is ready
    function init() {
        initCanvas();
        start();

        // Event listeners
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Start when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API for external control
    window.canvasBackground = {
        start: start,
        stop: stop,
        setConfig: (newConfig) => {
            Object.assign(CONFIG, newConfig);
        }
    };
})();
