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
    } else if (typeof GRADUATES_DATA !== 'undefined' && Array.isArray(GRADUATES_DATA)) {
        allGraduates = GRADUATES_DATA;
    } else {
        allGraduates = [];
    }
    initializeDesigner();
}

function initializeDesigner() {
    // Get designer name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const designerName = urlParams.get('name');
    
    if (designerName) {
        const decodedName = decodeURIComponent(designerName);
        currentDesignerIndex = allGraduates.findIndex(
            graduate => getFullName(graduate) === decodedName
        );
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

function displayDesignerInfo(name) {
    const designerRecord = (typeof DESIGNER_DATA !== 'undefined' && Array.isArray(DESIGNER_DATA))
        ? DESIGNER_DATA.find(d => d.fullName === name)
        : null;

    const displayName = designerRecord ? getDisplayName(designerRecord) : formatFullDisplayName(name);

    const nameElement = document.getElementById('designerName');
    if (nameElement) {
        nameElement.textContent = displayName;
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
            emailElement.textContent = designerRecord.email;
            emailElement.style.display = '';
        } else {
            emailElement.style.display = 'none';
        }
    }

    setupSocialLink('linkedinLink', designerRecord ? designerRecord.linkedinUrl : '');
    setupSocialLink('portfolioLink', designerRecord ? designerRecord.websitePortfolioUrl : '');

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
    return `https://${trimmed}`;
}

function populateProjects(designerRecord) {
    const projectSlots = document.querySelectorAll('.designer-project');
    if (!projectSlots.length) return;

    const projects = [];
    if (designerRecord && designerRecord.projectA) projects.push(designerRecord.projectA);
    if (designerRecord && designerRecord.projectB) projects.push(designerRecord.projectB);

    projectSlots.forEach((slot, index) => {
        const project = projects[index];

        if (!project) {
            slot.style.display = 'none';
            return;
        }

        slot.style.display = '';

        const titleEl = slot.querySelector('.project-title');
        if (titleEl) {
            const prefix = index === 0 ? '01 ' : index === 1 ? '02 ' : '';
            titleEl.textContent = `${prefix}${project.title || 'Project'}`;
        }

        const descEl = slot.querySelector('.project-description');
        if (descEl) {
            const writeUp = project.writeUp || '';
            descEl.textContent = writeUp || 'Project description coming soon.';
        }

        const metaEl = slot.querySelector('.project-meta');
        if (metaEl) {
            metaEl.innerHTML = '';

            const platform = project.platformNameThesis || project.platformName;
            if (platform) {
                const p = document.createElement('p');
                p.textContent = `Platform: ${platform}`;
                metaEl.appendChild(p);
            }

            if (project.year) {
                const p = document.createElement('p');
                p.textContent = `Year: ${project.year}`;
                metaEl.appendChild(p);
            }

            if (project.supervisor) {
                const p = document.createElement('p');
                p.textContent = `Supervisor: ${project.supervisor}`;
                metaEl.appendChild(p);
            }

            if (Array.isArray(project.teammates) && project.teammates.length) {
                const p = document.createElement('p');
                p.textContent = `Teammates: ${project.teammates.join(', ')}`;
                metaEl.appendChild(p);
            }
        }

        const frames = slot.querySelectorAll('.project-frame');
        if (frames.length && Array.isArray(project.images) && project.images.length) {
            frames.forEach((frame, frameIndex) => {
                const imageName = project.images[frameIndex];
                if (imageName) {
                    frame.style.backgroundImage = `url('assets/projects/${imageName}')`;
                    frame.style.backgroundSize = 'cover';
                    frame.style.backgroundPosition = 'center';
                    frame.style.backgroundRepeat = 'no-repeat';
                } else {
                    frame.style.backgroundImage = '';
                }
            });
        }
    });
}
