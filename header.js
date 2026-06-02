// Shared Header Component
// This file generates the header/navbar used across all pages

let mainNavMenuIdCounter = 0;

const NAV_LINK_ARROW =
    '<span class="main-nav-link__arrow" aria-hidden="true"></span>';

function createHeader(activePage = '') {
    const menuId = `main-nav-menu-${++mainNavMenuIdCounter}`;
    const header = document.createElement('nav');
    header.className = 'main-navbar';
    header.innerHTML = `
        <div class="main-nav-logo">
            <a href="index.html">
                <img src="./assets/logoGroup2.svg" alt="2026" class="logo-year">
                <img src="./assets/logoGroup1.svg" alt="Division of Industrial Design Graduation Show" class="logo-text">
                <img src="./assets/logo2026Vertical.png" alt="2026 Division of Industrial Design Graduation Show" class="logo-vertical">
            </a>
        </div>
        <button type="button" class="main-nav-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="${menuId}">
            <span class="main-nav-toggle-icon" aria-hidden="true">
                <span class="main-nav-toggle-bar"></span>
                <span class="main-nav-toggle-bar"></span>
                <span class="main-nav-toggle-bar"></span>
            </span>
        </button>
        <div class="main-nav-links" id="${menuId}">
            <div class="main-nav-links-inner">
                <a href="index.html" class="main-nav-link${activePage === 'home' ? ' active' : ''}" data-nav="home" style="display: none;">Gradshow 26'</a>
                <a href="index.html#about-us-section" class="main-nav-link${activePage === 'about' ? ' active' : ''}" data-nav="about">About Us</a>
                <a href="index.html#graduates-grid-section" class="main-nav-link${activePage === 'graduates' ? ' active' : ''}" data-nav="graduates">Graduates</a>
                <a href="index.html#locate-us-section" class="main-nav-link${activePage === 'locate' ? ' active' : ''}" data-nav="locate">Locate Us</a>
                <a href="Gradbook_2026.pdf" class="main-nav-link main-nav-link--with-arrow main-nav-link--external" target="_blank" rel="noopener noreferrer">View Gradbook${NAV_LINK_ARROW}</a>
                <a href="https://cde.nus.edu.sg/did/" class="main-nav-link main-nav-link--with-arrow main-nav-link--external" target="_blank" rel="noopener noreferrer">About DID${NAV_LINK_ARROW}</a>
            </div>
        </div>
    `;
    return header;
}

function initMobileNav(nav) {
    const toggle = nav.querySelector('.main-nav-toggle');
    const menu = nav.querySelector('.main-nav-links');
    if (!toggle || !menu) return;

    const mobileMq = window.matchMedia('(max-width: 768px)');

    function setOpen(open) {
        const isMobile = mobileMq.matches;
        nav.classList.toggle('main-nav-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        if (isMobile) {
            menu.setAttribute('aria-hidden', open ? 'false' : 'true');
        } else {
            menu.removeAttribute('aria-hidden');
        }

        if (isMobile && open) {
            document.body.classList.add('main-nav-menu-open');
        } else {
            document.body.classList.remove('main-nav-menu-open');
        }
    }

    function closeMenu() {
        setOpen(false);
    }

    toggle.addEventListener('click', function () {
        setOpen(!nav.classList.contains('main-nav-open'));
    });

    menu.querySelectorAll('a[href]').forEach(function (link) {
        link.addEventListener('click', function () {
            if (mobileMq.matches) closeMenu();
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('main-nav-open')) closeMenu();
    });

    mobileMq.addEventListener('change', function (e) {
        if (!e.matches) closeMenu();
    });

    document.addEventListener('click', function (e) {
        if (!nav.classList.contains('main-nav-open') || !mobileMq.matches) return;
        if (!nav.contains(e.target)) closeMenu();
    });

    setOpen(false);
}

function initAllMobileNavs() {
    document.querySelectorAll('.main-navbar').forEach(initMobileNav);
}


            // <a class="footer-link" href="index.html#graduates-grid-section">Graduates</a>
            // <a class="footer-link" href="index.html#locate-us-section">Locate Us</a>
            // <a href="https://cde.nus.edu.sg/did/" class="footer-link" target="_blank" rel="noopener noreferrer">About DID</a>

function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'main-footer';
    footer.innerHTML = `
        <div class="footer-container">
        <div class="footer-left">
        <div class="footer-text">
        <p> See you at our graduation show! </p>
        </div>
        <nav class="footer-nav" aria-label="Footer">
            <div class="footer-icons">
                <a href="https://maps.app.goo.gl/fa3Wj8d9EWuB1vJaA" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </a>
                <a href="https://www.instagram.com/nusdidshow.26?igsh=c3B4ZnZnZHF2bGI0" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Check our Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                </a>
                <div class="footer-share-wrap" data-share-url="https://cde.nus.edu.sg/did/gradshows/2026/">
                    <button type="button" class="social-link footer-icon-btn" id="footerShareBtn" aria-label="Share" aria-expanded="false" aria-haspopup="true" aria-controls="footerShareMenu">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </button>
                    <div id="footerShareMenu" class="footer-share-menu" role="group" aria-label="Share on social media" hidden>
                        <a class="footer-share-item" data-share="telegram" href="#" target="_blank" rel="noopener noreferrer">
                            <span class="footer-share-icon-wrap" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="m22 2-7 20-4-9-9-4Z"></path>
                                    <path d="M15 15 5.5 9.5"></path>
                                </svg>
                            </span>
                            <span class="footer-share-label">Telegram</span>
                        </a>
                        <a class="footer-share-item" data-share="whatsapp" href="#" target="_blank" rel="noopener noreferrer">
                            <span class="footer-share-icon-wrap" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"></path>
                                </svg>
                            </span>
                            <span class="footer-share-label">WhatsApp</span>
                        </a>
                        <button type="button" class="footer-share-item footer-share-item--more" data-share="native" aria-label="Copy link or share using your device">
                            <span class="footer-share-icon-wrap" aria-hidden="true">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                            </span>
                            <span class="footer-share-label">Copy link or share</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        </div>
        <div class="footer-logo">
            <img src="./assets/logo2026Horizontal%20copy.png" alt="2026 Division of Industrial Design Graduation Show">
        </div>
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
        initMobileNav(header);
    }
}

const FOOTER_SHARE_BODY = `We warmly invite you to join us at the DID Graduation Show 2026.

#SeeHowWeDidIt.

2026 Division of Industrial Design Graduation Show — Check it out!`.trim();

function initFooterShareMenu(footer) {
    const wrap = footer.querySelector('.footer-share-wrap');
    const btn = footer.querySelector('#footerShareBtn');
    const menu = footer.querySelector('#footerShareMenu');
    if (!wrap || !btn || !menu) return;

    const dataUrl = (wrap.getAttribute('data-share-url') || '').trim();

    function getShareUrl() {
        if (dataUrl) return dataUrl;
        try {
            const u = new URL(window.location.href);
            u.hash = '';
            return u.href;
        } catch (err) {
            return (window.location.href || '').split('#')[0];
        }
    }

    function buildSharePayload() {
        const shareUrl = getShareUrl();
        const shareText = FOOTER_SHARE_BODY;
        const line = shareText + (shareUrl ? '\n\n' + shareUrl : '');
        return { shareUrl, shareText, line };
    }

    function applyShareLinks() {
        const p = buildSharePayload();
        const tg = menu.querySelector('[data-share="telegram"]');
        if (tg) {
            tg.href = 'https://t.me/share/url?url=' + encodeURIComponent(p.shareUrl) + '&text=' + encodeURIComponent(p.shareText);
        }
        const wa = menu.querySelector('[data-share="whatsapp"]');
        if (wa) {
            wa.href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(p.line || p.shareText || p.shareUrl);
        }
    }

    function setOpen(open) {
        menu.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) applyShareLinks();
    }

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(menu.hidden);
    });

    document.addEventListener('click', function (e) {
        if (menu.hidden) return;
        if (!wrap.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !menu.hidden) setOpen(false);
    });

    const nativeShareBtn = menu.querySelector('[data-share="native"]');
    if (nativeShareBtn) {
        const nativeLabel = nativeShareBtn.querySelector('.footer-share-label');

        function nativeCopyFeedback() {
            if (nativeLabel) {
                const orig = nativeLabel.textContent;
                nativeLabel.textContent = 'Copied to clipboard';
                window.setTimeout(function () { nativeLabel.textContent = orig; }, 2400);
            }
        }

        function tryCopyText(textToCopy) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(textToCopy);
            }
            return Promise.reject(new Error('no clipboard'));
        }

        function copyFallback(textToCopy) {
            try {
                const ta = document.createElement('textarea');
                ta.value = textToCopy;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.top = '40%';
                ta.style.left = '50%';
                ta.style.transform = 'translate(-50%, -50%)';
                ta.style.width = 'min(90vw, 24rem)';
                ta.style.height = '4rem';
                ta.style.zIndex = '13000';
                ta.style.opacity = '0.01';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                nativeCopyFeedback();
            } catch (err) {
                window.prompt('Copy this text (Ctrl+C, then Enter):', textToCopy);
                nativeCopyFeedback();
            }
        }

        function runNativeCopyFlow(copyStr) {
            tryCopyText(copyStr).then(function () {
                nativeCopyFeedback();
                setOpen(false);
            }).catch(function () {
                copyFallback(copyStr);
                setOpen(false);
            });
        }

        nativeShareBtn.addEventListener('click', function () {
            const p = buildSharePayload();
            const textToCopy = p.line || p.shareUrl || p.shareText;
            if (!textToCopy) return;

            const sharePayload = {
                title: 'DID Graduation Show 2026',
                text: p.shareText,
                url: p.shareUrl
            };

            if (navigator.share) {
                navigator.share(sharePayload).then(function () {
                    setOpen(false);
                }).catch(function (err) {
                    if (err && err.name === 'AbortError') return;
                    runNativeCopyFlow(textToCopy);
                });
                return;
            }

            runNativeCopyFlow(textToCopy);
        });
    }

    menu.querySelectorAll('a.footer-share-item').forEach(function (a) {
        a.addEventListener('click', function (e) {
            const resolved = a.getAttribute('href') || '';
            if (!resolved || resolved === '#') {
                e.preventDefault();
                return;
            }
            window.setTimeout(function () {
                setOpen(false);
            }, 0);
        });
    });
}

// Initialize footer on page load
function initFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        const footer = createFooter();
        footerPlaceholder.replaceWith(footer);
        initFooterShareMenu(footer);
    }
}

/**
 * On the long home layout (index inside #mainContent), toggle active nav state
 * for About Us, Graduates, and Locate Us based on scroll position.
 */
function initHomePageNavSpy() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    const nav = mainContent.querySelector('.main-navbar');
    if (!nav) return;

    const navItems = [
        { id: 'about-us-section', link: nav.querySelector('[data-nav="about"]') },
        { id: 'graduates-grid-section', link: nav.querySelector('[data-nav="graduates"]') },
        { id: 'locate-us-section', link: nav.querySelector('[data-nav="locate"]') },
    ].filter(function (item) {
        return item.link && document.getElementById(item.id);
    });

    if (!navItems.length) return;

    const homeLink = nav.querySelector('[data-nav="home"]');
    let rafId = 0;
    /** Pixels below the navbar bottom where a section becomes active (earlier = larger). */
    const sectionActivateLeadPx = 140;

    function sync() {
        rafId = 0;
        const navH = nav.getBoundingClientRect().height;
        const threshold = navH + sectionActivateLeadPx;
        let activeLink = navItems[0].link;

        navItems.forEach(function (item) {
            const rect = document.getElementById(item.id).getBoundingClientRect();
            if (rect.top <= threshold) {
                activeLink = item.link;
            }
        });

        navItems.forEach(function (item) {
            item.link.classList.toggle('active', item.link === activeLink);
        });

        if (homeLink) {
            homeLink.classList.remove('active');
        }
    }

    function onScrollOrResize() {
        if (rafId) return;
        rafId = requestAnimationFrame(sync);
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('hashchange', onScrollOrResize);
    window.addEventListener('load', onScrollOrResize, { once: true });
    sync();
}

/** Keep --navbar-scroll-offset in sync when desktop nav links wrap to two rows. */
function initNavbarScrollOffset() {
    const mobileMq = window.matchMedia('(max-width: 768px)');

    function sync() {
        if (mobileMq.matches) {
            document.documentElement.style.removeProperty('--navbar-scroll-offset');
            return;
        }

        let maxHeight = 0;
        document.querySelectorAll('.main-navbar:not(.loading-navbar)').forEach(function (navbar) {
            const h = navbar.offsetHeight;
            if (h > maxHeight) maxHeight = h;
        });

        if (maxHeight > 0) {
            document.documentElement.style.setProperty('--navbar-scroll-offset', maxHeight + 'px');
        }
    }

    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(sync);
        document.querySelectorAll('.main-navbar:not(.loading-navbar)').forEach(function (navbar) {
            observer.observe(navbar);
        });
    }

    window.addEventListener('resize', sync);
    mobileMq.addEventListener('change', sync);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(sync);
    }
    sync();
    requestAnimationFrame(sync);
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

    initAllMobileNavs();

    initHomePageNavSpy();

    initNavbarScrollOffset();
    
    // Initialize navbar scroll effect
    initNavbarScroll();

    loadGradQuizWidget();
});

function loadGradQuizWidget() {
    if (/gradquiz\.html/i.test(window.location.pathname)) return;
    if (document.querySelector('script[data-gradquiz-widget]')) return;

    const script = document.createElement('script');
    script.src = 'gradquiz-widget.js';
    script.dataset.gradquizWidget = '1';
    script.onload = function () {
        if (typeof initGradQuizWidget === 'function') initGradQuizWidget();
    };
    document.body.appendChild(script);
}