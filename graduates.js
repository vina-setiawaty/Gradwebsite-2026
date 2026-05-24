// Graduates Page JavaScript
// Requires: data/data.js to be loaded first

document.addEventListener('DOMContentLoaded', function() {
    loadGraduates();
});

async function loadGraduates() {
    try {
        const response = await fetch('data/graduates.json');
        const data = await response.json();
        renderGraduateCards(data.graduates);
    } catch (error) {
        console.error('Error loading graduates from JSON, using fallback data:', error);
        // Fallback: use embedded data
        renderGraduateCards(DESIGNER_DATA);
    }
}

function renderGraduateCards(graduates) {
    const grid = document.getElementById('graduatesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    graduates.forEach((graduate, index) => {
        const card = createGraduateCard(graduate, index);
        grid.appendChild(card);
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * True when href leaves the current site (different origin), so the page should open in a new tab.
 * Relative paths and same-origin URLs stay in-tab.
 */
function isOffSiteHref(href) {
    if (!href || typeof href !== 'string') return false;
    const trimmed = href.trim();
    if (!trimmed || /^mailto:|^tel:|^javascript:/i.test(trimmed)) return false;
    try {
        const resolved = new URL(trimmed, window.location.href);
        return resolved.origin !== window.location.origin;
    } catch {
        return false;
    }
}

function applyNewTabIfOffSite(anchor, href) {
    if (!anchor || !href) return;
    if (isOffSiteHref(href)) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
    }
}

/** Optional explicit card URL from JSON/data; otherwise designer profile. */
function getGraduateCardHref(graduate, fullName) {
    if (graduate && typeof graduate === 'object') {
        const keys = ['cardHref', 'cardUrl', 'externalUrl'];
        for (const key of keys) {
            const v = graduate[key];
            if (v != null && String(v).trim()) return String(v).trim();
        }
    }
    return `designer.html?name=${encodeURIComponent(fullName)}`;
}

function createGraduateCard(graduate, index) {
    // Handle both object format { fullName: "...", "headshot-image": "..." } and string format
    const fullName = typeof graduate === 'object' ? graduate.preferredFullName : graduate;
    const filename =
        typeof graduate === 'object' && graduate['headshot-image'] != null
            ? String(graduate['headshot-image']).trim()
            : '';
    const headshotRaw = filename ? `./headshotImages/${filename}` : '';
    const hasHeadshot = headshotRaw.length > 0;

    const card = document.createElement('a');
    const cardHref = getGraduateCardHref(graduate, fullName);
    card.href = cardHref;
    applyNewTabIfOffSite(card, cardHref);
    card.className = 'graduate-card';

    const photoHtml = hasHeadshot
        ? `<div class="graduate-photo-frame"><img class="graduate-headshot" src="${escapeHtml(headshotRaw)}" alt="${escapeHtml(fullName)}" loading="lazy" decoding="async"></div>`
        : `<div class="graduate-photo-frame graduate-photo-frame--empty"><span>PHOTO</span></div>`;

    card.innerHTML = `
        ${photoHtml}
        <div class="graduate-info">
            <span class="graduate-name">${escapeHtml(fullName)}</span>
        </div>
    `;

    return card;
}

function renderPlaceholderCards() {
    const grid = document.getElementById('graduatesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    for (let i = 0; i < 44; i++) {
        const card = document.createElement('div');
        card.className = 'graduate-card';
        card.innerHTML = `
            <div class="graduate-photo-frame graduate-photo-frame--empty">
                <span>PHOTO</span>
            </div>
            <div class="graduate-info">
                <span class="graduate-role">Graduate, Industrial Design 2026</span>
                <span class="graduate-name">Designer Name</span>
            </div>
        `;
        grid.appendChild(card);
    }
}
