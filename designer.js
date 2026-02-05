// Designer Page JavaScript
// Requires: data/data.js to be loaded first

let allGraduates = [];
let currentDesignerIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    loadDesignerData();
    initProjectGallery();
});

async function loadDesignerData() {
    try {
        const response = await fetch('data/graduates.json');
        const data = await response.json();
        allGraduates = data.graduates;
        initializeDesigner();
    } catch (error) {
        console.error('Error loading designer data from JSON, using fallback:', error);
        // Use fallback data
        allGraduates = GRADUATES_DATA;
        initializeDesigner();
    }
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
    } else {
        // Default to first designer
        currentDesignerIndex = 0;
        displayDesignerInfo(getFullName(allGraduates[0]));
    }
    
    // Load other designers
    loadOtherDesigners();
    
    // Update page title
    const currentGraduate = allGraduates[currentDesignerIndex];
    const currentName = currentGraduate ? getFullName(currentGraduate) : 'Designer';
    document.title = `${formatFullDisplayName(currentName)} | 2026 Division of Industrial Design Graduation Show`;
}

// Helper function to get fullName from graduate (handles both object and string formats)
function getFullName(graduate) {
    if (!graduate) return '';
    return typeof graduate === 'object' ? graduate.fullName : graduate;
}

function displayDesignerInfo(name) {
    const nameElement = document.getElementById('designerName');
    if (nameElement) {
        nameElement.textContent = formatFullDisplayName(name);
    }
    
    // Placeholder bio
    const bioElement = document.getElementById('designerBio');
    if (bioElement) {
        bioElement.textContent = `${formatFullDisplayName(name)} is a graduating student from the Division of Industrial Design at the National University of Singapore. Their work focuses on creating meaningful design solutions that address real-world problems through human-centered design approaches.`;
    }
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
        
        link.textContent = formatFullDisplayName(fullName);
        container.appendChild(link);
    });
}

function initProjectGallery() {
    const thumbnails = document.querySelectorAll('.project-thumbnail');
    const preview = document.getElementById('projectPreview');
    
    // Color mapping for demo
    const colors = ['#7a00db', '#00a86b', '#ff6b35', '#0066cc', '#ffc107'];
    
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked thumbnail
            this.classList.add('active');
            
            // Update preview color
            if (preview) {
                preview.style.backgroundColor = colors[index];
            }
        });
        
        // Hover effect
        thumb.addEventListener('mouseenter', function() {
            if (preview && !this.classList.contains('active')) {
                preview.style.backgroundColor = colors[index];
                preview.style.opacity = '0.7';
            }
        });
        
        thumb.addEventListener('mouseleave', function() {
            if (preview && !this.classList.contains('active')) {
                // Revert to active thumbnail color
                const activeThumb = document.querySelector('.project-thumbnail.active');
                if (activeThumb) {
                    const activeIndex = parseInt(activeThumb.dataset.index);
                    preview.style.backgroundColor = colors[activeIndex];
                }
                preview.style.opacity = '1';
            }
        });
    });
}
