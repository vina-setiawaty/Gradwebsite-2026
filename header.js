// Shared Header Component
// This file generates the header/navbar used across all pages

function createHeader(activePage = '') {
    const header = document.createElement('nav');
    header.className = 'main-navbar';
    header.innerHTML = `
        <div class="main-nav-logo">
            <a href="index.html">
                <img src="./assets/logoGroup2.svg" alt="2026" class="logo-year">
                <img src="./assets/logoGroup1.svg" alt="Division of Industrial Design Graduation Show" class="logo-text">
            </a>
        </div>
        <div class="main-nav-links">
            <a href="index.html" class="main-nav-link${activePage === 'home' ? ' active' : ''}">The Grad Show 26'</a>
            <a href="graduates.html" class="main-nav-link${activePage === 'graduates' ? ' active' : ''}">The Graduates</a>
            <a href="showcase.html" class="main-nav-link${activePage === 'showcase' ? ' active' : ''}">The Showcase</a>
        </div>
    `;
    return header;
}

function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="index.html" class="footer-link">The Grad Show 26'</a>
            <a href="graduates.html" class="footer-link">The Graduates</a>
            <a href="showcase.html" class="footer-link">The Showcase</a>
        </div>
        <div class="footer-logo">
            <img src="./assets/logo2026HorizontalHALF.png" alt="2026">
        </div>
    `;
    return footer;
}

// Initialize header on page load
function initHeader(activePage = '') {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        const header = createHeader(activePage);
        headerPlaceholder.replaceWith(header);
    }
}

// Initialize footer on page load
function initFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        const footer = createFooter();
        footerPlaceholder.replaceWith(footer);
    }
}

// Handle navbar scroll effect
function initNavbarScroll() {
    // Scroll threshold - navbar becomes solid after scrolling this many pixels
    const scrollThreshold = 50;
    
    function checkScroll() {
        // Get all navbars (there might be one in loading overlay and one in main content)
        const navbars = document.querySelectorAll('.main-navbar');
        
        navbars.forEach(navbar => {
            // Skip navbar inside loading overlay (it has loading-navbar class)
            if (navbar.classList.contains('loading-navbar')) return;
            
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Check on scroll
    window.addEventListener('scroll', checkScroll);
    
    // Initial check
    checkScroll();
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main header
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        const activePage = headerPlaceholder.dataset.active || '';
        const header = createHeader(activePage);
        headerPlaceholder.replaceWith(header);
    }
    
    // Initialize loading header (for index.html loading overlay)
    const loadingHeaderPlaceholder = document.getElementById('loading-header-placeholder');
    if (loadingHeaderPlaceholder) {
        const activePage = loadingHeaderPlaceholder.dataset.active || '';
        const header = createHeader(activePage);
        header.classList.add('loading-navbar');
        loadingHeaderPlaceholder.replaceWith(header);
    }
    
    // Initialize footer
    initFooter();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
});
