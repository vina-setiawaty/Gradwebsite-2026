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
        renderGraduateCards(GRADUATES_DATA);
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

function createGraduateCard(graduate, index) {
    // Handle both object format { fullName: "..." } and string format
    const fullName = typeof graduate === 'object' ? graduate.fullName : graduate;
    
    const card = document.createElement('a');
    card.href = `designer.html?name=${encodeURIComponent(fullName)}`;
    card.className = 'graduate-card';

    card.innerHTML = `
        <div class="graduate-photo-placeholder">
            <span>PHOTO</span>
        </div>
        <div class="graduate-info">
            <!-- <span class="graduate-role">Graduate, Industrial Design 2026</span> -->
            <span class="graduate-name">${fullName}</span>
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
            <div class="graduate-photo-placeholder">
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
