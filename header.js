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
            <a href="index.html" class="main-nav-link${activePage === 'home' ? ' active' : ''}" data-nav="home" style="display: none;">Gradshow 26'</a>
            <a href="index.html#graduates-grid-section" class="main-nav-link${activePage === 'graduates' ? ' active' : ''}" data-nav="graduates">Graduates</a>
            <a href="showcase.html" class="main-nav-link${activePage === 'showcase' ? ' active' : ''}" data-nav="showcase">Showcase</a>
            <a class="main-nav-link main-nav-link--placeholder" aria-disabled="true">Gradbook</a>
            <a href="https://cde.nus.edu.sg/did/" class="main-nav-link" target="_blank" rel="noopener noreferrer">About DID</a>
        </div>
    `;
    return header;
}

function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    footer.innerHTML = `
        <div class="footer-links">
            <a href="index.html" class="footer-link">The Gradshow 26'</a>
            <a href="index.html#graduates-grid-section" class="footer-link">The Graduates</a>
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

/**
 * On the long home layout (index inside #mainContent), toggle active state between
 * "The Grad Show 26'" and "The Graduates" based on scroll position.
 */
function initHomePageGraduatesNavSpy() {
    const mainContent = document.getElementById('mainContent');
    const section = document.getElementById('graduates-grid-section');
    if (!mainContent || !section || !mainContent.contains(section)) return;

    const nav = mainContent.querySelector('.main-navbar');
    if (!nav) return;

    const homeLink = nav.querySelector('[data-nav="home"]');
    const gradLink = nav.querySelector('[data-nav="graduates"]');
    if (!homeLink || !gradLink) return;

    let rafId = 0;
    /** Pixels below the navbar bottom where "The Graduates" becomes active (earlier = larger). */
    const graduatesActivateLeadPx = 140;

    function sync() {
        rafId = 0;
        const navH = nav.getBoundingClientRect().height;
        const rect = section.getBoundingClientRect();
        const inGraduates =
            rect.top <= navH + graduatesActivateLeadPx && rect.bottom > navH + 32;

        homeLink.classList.toggle('active', !inGraduates);
        gradLink.classList.toggle('active', inGraduates);
    }

    function onScrollOrResize() {
        if (rafId) return;
        rafId = requestAnimationFrame(sync);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('hashchange', onScrollOrResize);
    sync();
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