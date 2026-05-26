// Designer Page JavaScript
// Requires: data/data.js to be loaded first

let allGraduates = [];
let currentDesignerIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    loadDesignerData();
});

function loadDesignerData() {
    // Use rich designer dataset when available, otherwise fall back to basic list
    if (typeof DESIGNER_DATA !== 'undefined' && Array.isArray(DESIGNER_DATA)) {
        allGraduates = DESIGNER_DATA;
    } else {
        allGraduates = [];
    }
    initializeDesigner();
}

/** Match URL ?name= by legal fullName or preferredFullName. */
function findDesignerRecord(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed || typeof DESIGNER_DATA === 'undefined' || !Array.isArray(DESIGNER_DATA)) {
        return null;
    }
    return (
        DESIGNER_DATA.find(d => {
            const full = String(d.fullName || '').trim();
            const preferred = String(d.preferredFullName || '').trim();
            return full === trimmed || preferred === trimmed;
        }) || null
    );
}

function findDesignerIndex(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return -1;
    return allGraduates.findIndex(g => {
        if (!g || typeof g !== 'object') return false;
        const full = String(g.fullName || '').trim();
        const preferred = String(g.preferredFullName || '').trim();
        return full === trimmed || preferred === trimmed;
    });
}

function initializeDesigner() {
    // Get designer name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const designerName = urlParams.get('name');
    
    if (designerName) {
        const decodedName = decodeURIComponent(designerName);
        currentDesignerIndex = findDesignerIndex(decodedName);
        displayDesignerInfo(decodedName);
    } else if (allGraduates.length > 0) {
        // Default to first designer
        currentDesignerIndex = 0;
        displayDesignerInfo(getFullName(allGraduates[0]));
    } else {
        currentDesignerIndex = -1;
        displayDesignerInfo('');
    }
    
    // Load other designers
    loadOtherDesigners();
    
    // Update page title
    const currentGraduate = allGraduates[currentDesignerIndex];
    const currentName = currentGraduate ? getFullName(currentGraduate) : 'Designer';
    document.title = `${getDisplayName(currentGraduate)} | 2026 Division of Industrial Design Graduation Show`;
}

// Helper function to get fullName from graduate (handles both object and string formats)
function getFullName(graduate) {
    if (!graduate) return '';
    return typeof graduate === 'object' ? graduate.fullName : graduate;
}

/** Filename from record; empty if missing. */
function getHeadshotFilename(record) {
    if (!record || typeof record !== 'object') return '';
    const v = record['headshot-image'];
    return v != null ? String(v).trim() : '';
}

function getHeadshotSrc(record) {
    const filename = getHeadshotFilename(record);
    return filename ? `./headshotImages/${filename}` : '';
}

function renderDesignerHeadshot(record) {
    const card = document.getElementById('designerPhotoCard');
    if (!card) return;

    const src = getHeadshotSrc(record);
    const alt = record ? getDisplayName(record) : 'Designer headshot';

    card.innerHTML = '';
    if (src) {
        const img = document.createElement('img');
        img.className = 'designer-headshot';
        img.src = src;
        img.alt = alt;
        img.loading = 'lazy';
        img.decoding = 'async';
        card.appendChild(img);
    } else {
        const placeholder = document.createElement('div');
        placeholder.className = 'designer-photo-placeholder';
        const span = document.createElement('span');
        span.textContent = 'PHOTO';
        placeholder.appendChild(span);
        card.appendChild(placeholder);
    }
}

function displayDesignerInfo(name) {
    let designerRecord = findDesignerRecord(name);
    if (!designerRecord && currentDesignerIndex >= 0) {
        designerRecord = allGraduates[currentDesignerIndex];
    }

    // Hero heading uses preferredFirstName; bio/links use preferredFullName. URLs use fullName.
    const displayName = designerRecord ? getDisplayName(designerRecord) : formatFullDisplayName(name);
    const headingName = designerRecord ? getDesignerHeadingName(designerRecord) : formatFullDisplayName(name);

    const nameElement = document.getElementById('designerName');
    if (nameElement) {
        nameElement.textContent = headingName;
    }

    // Bio / personal description
    const bioElement = document.getElementById('designerBio');
    if (bioElement) {
        if (designerRecord && designerRecord.personalDescription) {
            bioElement.textContent = designerRecord.personalDescription;
        } else {
            bioElement.textContent = `${displayName} is a graduating student from the Division of Industrial Design at the National University of Singapore. Their work focuses on creating meaningful design solutions that address real-world problems through human-centered design approaches.`;
        }
    }

    // Profile line (specialisation / industry)
    const roleElement = document.getElementById('designerRole');
    if (roleElement) {
        if (designerRecord) {
            const profileParts = [];
            if (designerRecord.specialisation) profileParts.push(designerRecord.specialisation);
            if (designerRecord.industryType) profileParts.push(designerRecord.industryType);
            roleElement.textContent = profileParts.length
                ? profileParts.join(' · ')
                : 'Graduate, Industrial Design 2026';
        } else {
            roleElement.textContent = 'Graduate, Industrial Design 2026';
        }
    }

    // Expertise & specialisation lists
    populateListFromCsv('expertiseList', designerRecord ? designerRecord.industryType : '');
    populateListFromCsv('specializationList', designerRecord ? designerRecord.specialisation : '');

    // Contact information
    const emailElement = document.getElementById('designerEmail');
    if (emailElement) {
        if (designerRecord && designerRecord.email) {
            const addr = String(designerRecord.email).trim();
            emailElement.textContent = addr;
            emailElement.href = `mailto:${addr}`;
            emailElement.style.display = '';
        } else {
            emailElement.style.display = 'none';
        }
    }

    setupSocialLink('linkedinLink', designerRecord ? designerRecord.linkedinUrl : '');
    setupSocialLink('portfolioLink', designerRecord ? designerRecord.websitePortfolioUrl : '');
    setupSocialLink('behanceLink', designerRecord ? designerRecord.behanceUrl : '');
    setupSocialLink('instagramLink', designerRecord ? designerRecord.instagramUrl : '');

    renderDesignerHeadshot(designerRecord);

    // Projects and images
    populateProjects(designerRecord);
}

function formatFullDisplayName(fullName) {
    if (!fullName) return 'Designer';
    
    // Handle names like "KOH YI NING, PRISCILLA" -> "Priscilla Koh Yi Ning"
    if (fullName.includes(',')) {
        const parts = fullName.split(',');
        const surname = parts[0].trim();
        const givenName = parts[1].trim();
        return toTitleCase(`${givenName} ${surname}`);
    }
    
    // Regular names - just title case
    return toTitleCase(fullName);
}

function getDisplayName(graduate) {
    if (!graduate || typeof graduate !== 'object') {
        return formatFullDisplayName(getFullName(graduate));
    }
    if (graduate.preferredFullName) {
        return graduate.preferredFullName;
    }
    return formatFullDisplayName(graduate.fullName || '');
}

/** Large hero heading (#designerName) — first name only when available. */
function getDesignerHeadingName(graduate) {
    if (!graduate || typeof graduate !== 'object') {
        return formatFullDisplayName(getFullName(graduate));
    }
    const first = graduate.preferredFirstName != null ? String(graduate.preferredFirstName).trim() : '';
    if (first) return first;
    return getDisplayName(graduate);
}

function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function loadOtherDesigners() {
    const container = document.getElementById('otherDesignersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get all designers (including current one)
    allGraduates.forEach((graduate, index) => {
        const fullName = getFullName(graduate);
        const link = document.createElement('a');
        link.href = `designer.html?name=${encodeURIComponent(fullName)}`;
        link.className = 'other-designer-link';

        // Highlight current designer
        if (index === currentDesignerIndex) {
            link.classList.add('current');
        }

        link.textContent = getDisplayName(graduate);
        container.appendChild(link);
    });
}

function populateListFromCsv(elementId, csv) {
    const listEl = document.getElementById(elementId);
    if (!listEl) return;

    listEl.innerHTML = '';
    if (!csv) {
        return;
    }

    const parts = csv.split(',').map(part => part.trim()).filter(Boolean);
    parts.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        listEl.appendChild(li);
    });
}

function setupSocialLink(elementId, url) {
    const linkEl = document.getElementById(elementId);
    if (!linkEl) return;

    if (url) {
        linkEl.href = normalizeUrl(url);
        linkEl.style.display = 'inline-flex';
    } else {
        linkEl.style.display = 'none';
    }
}

function normalizeUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    if (trimmed.startsWith('@')) {
        const handle = trimmed.slice(1).replace(/^@/, '');
        return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
    }
    return `https://${trimmed}`;
}

/** Normalise to https://www.youtube.com/embed/… (+ original ?query) like YouTube’s share embed HTML. */
function getYouTubeEmbedSrc(videoURL) {
    const raw = videoURL == null ? '' : String(videoURL).trim();
    if (!raw) return null;
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    let url;
    try {
        url = new URL(withProto);
    } catch {
        return null;
    }
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        const path = url.pathname;
        if (path.startsWith('/embed/')) {
            const id = path.slice('/embed/'.length).split('/')[0]?.split('?')[0] || null;
            if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
            return `https://www.youtube.com/embed/${id}${url.search}`;
        }
    }

    let id = null;
    if (host === 'youtu.be') {
        id = url.pathname.split('/').filter(Boolean)[0] || null;
    } else if (host === 'm.youtube.com') {
        id = url.searchParams.get('v');
    } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        const path = url.pathname;
        if (path.includes('/shorts/')) {
            id = path.split('/shorts/')[1]?.split('/')[0] || null;
        } else {
            id = url.searchParams.get('v');
        }
    }
    if (!id) return null;
    id = id.split(/[?&]/)[0];
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
    const si = url.searchParams.get('si');
    const tail = si ? `?si=${encodeURIComponent(si)}` : '';
    return `https://www.youtube.com/embed/${id}${tail}`;
}

/** Display year like "June 2025" when value is a 4-digit year; otherwise as-is. */
function formatProjectYear(year) {
    if (year == null || year === '') return '';
    const s = String(year).trim();
    if (/^\d{4}$/.test(s)) return `${s}`;
    return s;
}

const SLIDER_EXPANDED_CLASS = 'project-frame-img--expanded';

function tearDownDesignerProjectSlider(track) {
    if (!track || typeof track._sliderCleanup !== 'function') return;
    track._sliderCleanup();
    track._sliderCleanup = null;
}

function debounce(fn, ms) {
    let t;
    return function debounced(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
    };
}

function readGapPx(track) {
    const style = getComputedStyle(track);
    const raw = style.columnGap && style.columnGap !== 'normal'
        ? style.columnGap
        : style.gap;
    const v = parseFloat(String(raw).split(/\s+/)[0]);
    return Number.isFinite(v) ? v : 8;
}

const STRIP_MIN_COLLAPSED_PX = 28;
const PROJECT_TRACK_MIN_HEIGHT_PX = 230;
const PROJECT_STRIP_STACKED_MQ = window.matchMedia('(max-width: 768px)');

function isProjectStripStackedLayout() {
    return PROJECT_STRIP_STACKED_MQ.matches;
}

function maxLoadedImageAspect(imgs) {
    let max = 0;
    for (const img of imgs) {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            max = Math.max(max, img.naturalWidth / img.naturalHeight);
        }
    }
    return max;
}

function readStripInnerWidth(track, frameCount) {
    const gapPx = readGapPx(track);
    const gapsTotal = Math.max(0, frameCount - 1) * gapPx;
    let w = track.getBoundingClientRect().width;
    if (w < 1) {
        const visual = track.closest('.designer-project-visual');
        w = visual?.getBoundingClientRect().width ?? 0;
    }
    return Math.max(0, w - gapsTotal);
}

/**
 * Track height = min(info column height, height that lets the widest image expand fully).
 * On stacked/mobile layout, CSS fixed height applies instead.
 */
function syncProjectVisualHeight(slot, track, frames, imgs) {
    if (!track) return;

    if (isProjectStripStackedLayout()) {
        track.style.removeProperty('--project-track-height');
        return;
    }

    const n = imgs.length;
    if (!n) return;

    const info = slot.querySelector('.designer-project-info');
    const H_cap = info?.offsetHeight ?? 0;
    const S = readStripInnerWidth(track, n);
    const maxAspect = maxLoadedImageAspect(imgs);

    if (maxAspect <= 0 || S < 1) {
        track.style.setProperty('--project-track-height', `${PROJECT_TRACK_MIN_HEIGHT_PX}px`);
        return;
    }

    const k = Math.max(0, n - 1);
    const widthForExpanded = n > 1 ? S - k * STRIP_MIN_COLLAPSED_PX : S;
    let H_fit = widthForExpanded / maxAspect;
    if (!Number.isFinite(H_fit) || H_fit < 1) {
        H_fit = PROJECT_TRACK_MIN_HEIGHT_PX;
    }

    let H_track = H_cap > 0 ? Math.min(H_cap, H_fit) : H_fit;
    H_track = Math.max(PROJECT_TRACK_MIN_HEIGHT_PX, H_track);
    track.style.setProperty('--project-track-height', `${Math.round(H_track)}px`);
}

/**
 * Sets each slot width on .project-frame-media (animated). Image fills that box
 * so the frame's grey background does not flash during max-width transitions.
 */
function clearProjectStripInlineWidths(frames) {
    frames.forEach(frame => {
        const media = frame.querySelector('.project-frame-media');
        const img = frame.querySelector('.project-frame-img');
        if (media) media.style.removeProperty('max-width');
        if (img) img.style.removeProperty('max-width');
    });
}

function applyProjectStripWidths(track, frames, expandedIndex) {
    const imgs = frames.map(f => f.querySelector('.project-frame-img')).filter(Boolean);
    const n = imgs.length;
    if (!track || n === 0) return;

    if (isProjectStripStackedLayout()) {
        clearProjectStripInlineWidths(frames);
        return;
    }

    const rect = track.getBoundingClientRect();
    let h = rect.height;
    if (h < 1) h = PROJECT_TRACK_MIN_HEIGHT_PX;

    const gapPx = readGapPx(track);
    const gapsTotal = Math.max(0, n - 1) * gapPx;
    const S = Math.max(0, rect.width - gapsTotal);

    function intrinsicW(img) {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            return (img.naturalWidth / img.naturalHeight) * h;
        }
        return S / n;
    }

    function setSlotWidth(frame, px) {
        const media = frame.querySelector('.project-frame-media');
        const img = frame.querySelector('.project-frame-img');
        const w = `${Math.round(Math.max(0, px))}px`;
        if (media) {
            media.style.maxWidth = w;
            if (img) img.style.removeProperty('max-width');
        } else if (img) {
            img.style.maxWidth = w;
        }
    }

    if (n === 1) {
        const w = intrinsicW(imgs[0]);
        setSlotWidth(frames[0], Math.min(w, S));
        return;
    }

    const k = n - 1;
    const expImg = imgs[expandedIndex];
    const leftCount = expandedIndex;
    const rightCount = n - 1 - expandedIndex;
    let wExp = intrinsicW(expImg);
    wExp = Math.min(wExp, S);

    function slotWidthForIndex(i, wExpanded, wCollLeft, wCollRight) {
        if (i === expandedIndex) return wExpanded;
        if (i < expandedIndex) return wCollLeft;
        return wCollRight;
    }

    if (leftCount === 0 || rightCount === 0) {
        let wColl = (S - wExp) / k;
        if (wColl < STRIP_MIN_COLLAPSED_PX) {
            wExp = Math.min(intrinsicW(expImg), S - k * STRIP_MIN_COLLAPSED_PX);
            wColl = (S - wExp) / k;
        }
        frames.forEach((frame, i) => {
            setSlotWidth(frame, slotWidthForIndex(i, wExp, wColl, wColl));
        });
        return;
    }

    let wCollLeft = (S - wExp) / k;
    let wCollRight = (S - wExp - leftCount * wCollLeft) / rightCount;

    if (wCollRight < STRIP_MIN_COLLAPSED_PX) {
        wCollRight = STRIP_MIN_COLLAPSED_PX;
        wExp = Math.min(
            intrinsicW(expImg),
            S - leftCount * wCollLeft - rightCount * wCollRight
        );
        wCollRight = (S - wExp - leftCount * wCollLeft) / rightCount;
    }

    if (wCollLeft < STRIP_MIN_COLLAPSED_PX || wCollRight < STRIP_MIN_COLLAPSED_PX) {
        wExp = Math.min(intrinsicW(expImg), S - k * STRIP_MIN_COLLAPSED_PX);
        wCollLeft = (S - wExp) / k;
        wCollRight = wCollLeft;
    }

    frames.forEach((frame, i) => {
        setSlotWidth(frame, slotWidthForIndex(i, wExp, wCollLeft, wCollRight));
    });
}
function setupDesignerProjectSlider(slot) {
    const track = slot.querySelector('.designer-project-visual-track');
    if (!track) return;

    tearDownDesignerProjectSlider(track);

    const frames = Array.from(track.querySelectorAll('.project-frame')).filter(
        f => f.style.display !== 'none'
    );
    if (!frames.length) return;

    let currentIndex = 0;

    /** Monotonic id for the width transition currently in flight */
    let activeTransitionBatchId = 0;
    let isWidthTransitioning = false;
    let batchCompleteDebounce = null;
    let stuckTransitionTimer = null;

    /** After a pointer-driven expand finishes, ignore pointer until the next mousemove */
    let requirePointerMoveAfterExpand = false;
    let lastPointerX = -1;
    let lastPointerY = -1;
    let pointerIdleTimer = null;
    let lastExpandSource = 'init';

    const POINTER_IDLE_MS = 140;

    const imgs = frames.map(f => f.querySelector('.project-frame-img')).filter(Boolean);
    const medias = frames.map(f => f.querySelector('.project-frame-media')).filter(Boolean);

    function applyLayout() {
        syncProjectVisualHeight(slot, track, frames, imgs);
        void track.offsetHeight;
        if (isProjectStripStackedLayout()) {
            clearProjectStripInlineWidths(frames);
            clearExpanded();
            return;
        }
        applyProjectStripWidths(track, frames, currentIndex);
    }
    const applyLayoutDebounced = debounce(applyLayout, 80);

    function onStripLayoutModeChange() {
        if (isProjectStripStackedLayout()) {
            applyLayoutDebounced();
        } else {
            applyExpandFrame(0, 'init');
        }
    }
    PROJECT_STRIP_STACKED_MQ.addEventListener('change', onStripLayoutModeChange);

    function hitTestFrame(clientX, clientY) {
        for (let i = 0; i < frames.length; i++) {
            const r = frames[i].getBoundingClientRect();
            if (
                clientX >= r.left &&
                clientX < r.right &&
                clientY >= r.top &&
                clientY < r.bottom
            ) {
                return i;
            }
        }
        return null;
    }

    function tryExpandFromPointerIdle() {
        if (isProjectStripStackedLayout()) return;
        if (isWidthTransitioning) return;
        if (requirePointerMoveAfterExpand) return;
        if (lastPointerX < 0) return;
        const idx = hitTestFrame(lastPointerX, lastPointerY);
        if (idx === null || idx === currentIndex) return;
        applyExpandFrame(idx, 'pointer');
    }

    function onTrackMouseMove(e) {
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
        if (requirePointerMoveAfterExpand && !isWidthTransitioning) {
            requirePointerMoveAfterExpand = false;
        }
        clearTimeout(pointerIdleTimer);
        pointerIdleTimer = setTimeout(tryExpandFromPointerIdle, POINTER_IDLE_MS);
    }

    track.addEventListener('mousemove', onTrackMouseMove);

    function completeTransitionBatch(batchId) {
        if (batchId !== activeTransitionBatchId) return;
        if (!isWidthTransitioning) return;
        clearTimeout(stuckTransitionTimer);
        stuckTransitionTimer = null;
        clearTimeout(batchCompleteDebounce);
        batchCompleteDebounce = null;
        isWidthTransitioning = false;
        if (lastExpandSource === 'pointer') {
            requirePointerMoveAfterExpand = true;
        }
        clearTimeout(pointerIdleTimer);
        pointerIdleTimer = null;
    }

    function signalTransitionBatchMaybeComplete(batchId) {
        clearTimeout(batchCompleteDebounce);
        batchCompleteDebounce = setTimeout(() => {
            batchCompleteDebounce = null;
            if (batchId !== activeTransitionBatchId) return;
            completeTransitionBatch(batchId);
        }, 70);
    }

    function onTrackTransitionEnd(e) {
        const t = e.target;
        if (!medias.includes(t)) return;
        if (e.propertyName !== 'max-width') return;
        if (!isWidthTransitioning) return;
        signalTransitionBatchMaybeComplete(activeTransitionBatchId);
    }

    track.addEventListener('transitionend', onTrackTransitionEnd);

    const resizeObserver = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => applyLayoutDebounced())
        : null;
    if (resizeObserver) {
        resizeObserver.observe(track);
        const infoCol = slot.querySelector('.designer-project-info');
        const visualCol = slot.querySelector('.designer-project-visual');
        if (infoCol) resizeObserver.observe(infoCol);
        if (visualCol) resizeObserver.observe(visualCol);
    }

    const loadRefs = [];
    imgs.forEach(img => {
        const onLoad = () => applyLayout();
        loadRefs.push({ img, onLoad });
        if (img.complete && img.naturalHeight) onLoad();
        else img.addEventListener('load', onLoad);
    });
    applyLayout();

    function clearExpanded() {
        imgs.forEach(img => img.classList.remove(SLIDER_EXPANDED_CLASS));
    }

    function applyExpandFrame(i, source = 'pointer') {
        if (isProjectStripStackedLayout()) return;
        activeTransitionBatchId += 1;
        const batchId = activeTransitionBatchId;
        isWidthTransitioning = true;
        lastExpandSource = source;

        clearTimeout(stuckTransitionTimer);
        stuckTransitionTimer = setTimeout(() => {
            stuckTransitionTimer = null;
            if (batchId === activeTransitionBatchId && isWidthTransitioning) {
                completeTransitionBatch(batchId);
            }
        }, 650);

        clearExpanded();
        currentIndex = ((i % frames.length) + frames.length) % frames.length;
        imgs[currentIndex]?.classList.add(SLIDER_EXPANDED_CLASS);
        applyLayout();
    }

    if (isProjectStripStackedLayout()) {
        applyLayout();
    } else {
        applyExpandFrame(0, 'init');
    }

    track._sliderCleanup = () => {
        PROJECT_STRIP_STACKED_MQ.removeEventListener('change', onStripLayoutModeChange);
        clearTimeout(batchCompleteDebounce);
        batchCompleteDebounce = null;
        clearTimeout(stuckTransitionTimer);
        stuckTransitionTimer = null;
        clearTimeout(pointerIdleTimer);
        pointerIdleTimer = null;
        track.removeEventListener('mousemove', onTrackMouseMove);
        track.removeEventListener('transitionend', onTrackTransitionEnd);
        if (resizeObserver) resizeObserver.disconnect();
        track.style.removeProperty('--project-track-height');
        loadRefs.forEach(({ img, onLoad }) => {
            img.removeEventListener('load', onLoad);
            img.style.removeProperty('max-width');
        });
        medias.forEach(m => m.style.removeProperty('max-width'));
        clearExpanded();
        isWidthTransitioning = false;
        requirePointerMoveAfterExpand = false;
    };
}

/** If writeUp contains an <a> tag, render as HTML (trusted data); otherwise plain text with line breaks. */
function renderProjectWriteUp(element, writeUp) {
    const fallback = 'Project description coming soon.';
    if (!element) return;
    if (!writeUp) {
        element.textContent = fallback;
        element.classList.remove('project-description--html');
        return;
    }
    if (/<\s*a[\s>]/i.test(writeUp)) {
        element.classList.add('project-description--html');
        element.innerHTML = String(writeUp).replace(/\r\n|\r|\n/g, '<br>');
        return;
    }
    element.classList.remove('project-description--html');
    element.textContent = writeUp;
}

function populateProjects(designerRecord) {
    const projectSlots = document.querySelectorAll('.designer-project');
    if (!projectSlots.length) return;

    const projects = [];
    if (designerRecord && designerRecord.projectA) projects.push(designerRecord.projectA);
    if (designerRecord && designerRecord.projectB) projects.push(designerRecord.projectB);
    // console.log(designerRecord);

    projectSlots.forEach((slot, index) => {
        const project = projects[index];

        if (!project) {
            tearDownDesignerProjectSlider(slot.querySelector('.designer-project-visual-track'));
            slot.style.display = 'none';
            const videoWrap = slot.querySelector('.project-video');
            const videoIframe = videoWrap?.querySelector('.project-video-iframe');
            if (videoWrap && videoIframe) {
                videoIframe.removeAttribute('src');
                videoWrap.hidden = true;
            }
            return;
        }

        slot.style.display = '';

        const titleEl = slot.querySelector('.project-title');
        if (titleEl) {
            const prefix = index === 0 ? '01 ' : index === 1 ? '02 ' : '';
            const titleText = project.title || 'Project';
            titleEl.replaceChildren();
            if (prefix) {
                const prefixSpan = document.createElement('span');
                prefixSpan.className = 'project-title-prefix';
                prefixSpan.textContent = prefix;
                titleEl.appendChild(prefixSpan);
            }
            const titleSpan = document.createElement('span');
            titleSpan.className = 'project-title-text';
            titleSpan.textContent = titleText;
            titleEl.appendChild(titleSpan);
        }

        const ledeEl = slot.querySelector('.project-lede');
        if (ledeEl) {
            const platform = project.platformNameThesis || project.platformName || '';
            const trimmed = String(platform).trim();
            ledeEl.textContent = trimmed;
            ledeEl.hidden = !trimmed;
        }

        const descEl = slot.querySelector('.project-description');
        if (descEl) {
            renderProjectWriteUp(descEl, project.writeUp || '');
        }

        const dateEl = slot.querySelector('.project-date');
        if (dateEl) {
            const formatted = formatProjectYear(project.year);
            dateEl.textContent = formatted;
            dateEl.hidden = !formatted;
        }

        const supervisorBlock = slot.querySelector('.project-detail--supervisor');
        const supervisorValue = supervisorBlock?.querySelector('.project-detail-value');
        const supervisorLabel = supervisorBlock?.querySelector('.project-detail-label');
        if (supervisorBlock && supervisorValue) {
            const sup = project.supervisor ? String(project.supervisor).trim() : '';
            supervisorValue.textContent = sup;
            supervisorBlock.hidden = !sup;
            if (supervisorLabel) {
                const platformThesis = String(project.platformNameThesis || '').trim();
                supervisorLabel.textContent =
                    platformThesis === 'Thesis' ? 'Thesis Supervisor' : 'Platform Supervisor';
            }
        }

        const teammatesBlock = slot.querySelector('.project-detail--teammates');
        const teammatesValue = teammatesBlock?.querySelector('.project-detail-value');
        if (teammatesBlock && teammatesValue) {
            const list = Array.isArray(project.teammates) ? project.teammates.map(t => String(t).trim()).filter(Boolean) : [];
            teammatesValue.textContent = list.join(', ');
            const hasTeammates = list.length > 0;
            teammatesBlock.style.display = hasTeammates ? '' : 'none';
            teammatesBlock.hidden = !hasTeammates;
        }

        const frames = slot.querySelectorAll('.project-frame');
        const imageList = Array.isArray(project.images)
            ? project.images.map(s => String(s).trim()).filter(Boolean)
            : [];

        const altBase = project.title || 'Project';

        frames.forEach((frame, frameIndex) => {
            const img = frame.querySelector('.project-frame-img');
            const imageName = imageList[frameIndex];
            if (imageName) {
                frame.style.display = '';
                if (img) {
                    const enc = encodeURIComponent(imageName);
                    img.src = `./projectImages/${enc}`;
                    img.alt = `${altBase} — image ${frameIndex + 1}`;
                }
            } else {
                frame.style.display = 'none';
                if (img) {
                    img.removeAttribute('src');
                    img.alt = '';
                }
            }
        });

        const videoWrap = slot.querySelector('.project-video');
        const videoIframe = videoWrap?.querySelector('.project-video-iframe');
        if (videoWrap && videoIframe) {
            const embedSrc = getYouTubeEmbedSrc(project.videoURL ?? project.videoUrl);
            if (embedSrc) {
                videoIframe.src = embedSrc;
                videoIframe.title = 'YouTube video player';
                videoWrap.hidden = false;
            } else {
                videoIframe.removeAttribute('src');
                videoIframe.title = 'YouTube video player';
                videoWrap.hidden = true;
            }
        }

        setupDesignerProjectSlider(slot);
    });
}
