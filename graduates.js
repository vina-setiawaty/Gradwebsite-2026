// Graduates Page JavaScript
// Requires: data/data.js to be loaded first

document.addEventListener('DOMContentLoaded', function() {
    renderGraduateCards(DESIGNER_DATA);
});

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

/** Optional explicit card URL from data; otherwise designer profile. */
function getProjectAFirstImageSrc(graduate) {
    if (!graduate || typeof graduate !== 'object') return '';
    const projectA = graduate.projectA;
    if (!projectA || !Array.isArray(projectA.images)) return '';
    const images = projectA.images.map((s) => String(s).trim()).filter(Boolean);
    if (!images.length) return '';

    let pickIndex = 0;
    const configured = graduate.cardProjectPeekImageIndex;
    if (
        configured != null &&
        Number.isFinite(Number(configured)) &&
        Number(configured) >= 0 &&
        Number(configured) < images.length
    ) {
        pickIndex = Math.floor(Number(configured));
    }

    const picked = images[pickIndex];
    if (!picked) return '';
    return `./projectImages/${encodeURIComponent(picked)}`;
}

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

function createGraduateCard(graduate, index, options) {
    const cardClass =
        options && options.cardClass ? String(options.cardClass) : 'graduate-card';
    // Handle both object format { fullName: "...", "headshot-image": "..." } and string format
    const fullName = typeof graduate === 'object' ? graduate.preferredFullName : graduate;
    const projectATitle =
        typeof graduate === 'object' && graduate.projectA?.title != null
            ? String(graduate.projectA.title).trim()
            : '';
    const filename =
        typeof graduate === 'object' && graduate['headshot-image'] != null
            ? String(graduate['headshot-image']).trim()
            : '';
    const headshotRaw = filename ? `./headshotImages/${filename}` : '';
    const hasHeadshot = headshotRaw.length > 0;
    const projectImageRaw =
        typeof graduate === 'object' ? getProjectAFirstImageSrc(graduate) : '';
    const hasProjectHover = hasHeadshot && projectImageRaw.length > 0;
    const shouldSwapNameOnHover = hasProjectHover && projectATitle.length > 0;

    const card = document.createElement('a');
    const cardHref = getGraduateCardHref(graduate, fullName);
    card.href = cardHref;
    applyNewTabIfOffSite(card, cardHref);
    card.className = cardClass;

    let photoHtml;
    if (hasHeadshot && hasProjectHover) {
        const projectTitle =
            typeof graduate === 'object' && graduate.projectA?.title
                ? String(graduate.projectA.title).trim()
                : 'Project';
        const projectPeekPosClass =
            typeof graduate === 'object' && graduate.cardProjectPeekAlignBottom === true
                ? ' graduate-headshot--project-pos-bottom'
                : '';
        photoHtml = `<div class="graduate-photo-frame graduate-photo-frame--hoverable">
            <img class="graduate-headshot graduate-headshot--default" src="${escapeHtml(headshotRaw)}" alt="${escapeHtml(fullName)}" loading="lazy" decoding="async">
            <img class="graduate-headshot graduate-headshot--project${projectPeekPosClass}" src="${escapeHtml(projectImageRaw)}" alt="${escapeHtml(fullName)} — ${escapeHtml(projectTitle)}" loading="lazy" decoding="async">
        </div>`;
    } else if (hasHeadshot) {
        photoHtml = `<div class="graduate-photo-frame"><img class="graduate-headshot" src="${escapeHtml(headshotRaw)}" alt="${escapeHtml(fullName)}" loading="lazy" decoding="async"></div>`;
    } else {
        photoHtml = `<div class="graduate-photo-frame graduate-photo-frame--empty"><span>PHOTO</span></div>`;
    }

    card.innerHTML = `
        ${photoHtml}
        <div class="graduate-info">
            <span class="graduate-name graduate-name--default">${escapeHtml(fullName)}</span>
            ${
                shouldSwapNameOnHover
                    ? `<span class="graduate-name graduate-name--project">${escapeHtml(
                          projectATitle
                      )}</span>`
                    : ''
            }
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
