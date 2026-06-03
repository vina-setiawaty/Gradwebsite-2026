/**
 * Fixed bottom-right gradquiz promo widget (all pages via header.js).
 */
(function () {
    const QUIZ_TOOL_SESSION_KEY = 'gradshow2026_quizTool';

    const QUIZ_TOOL_IMAGES = {
        hammer: 'quiz_assets/hammer_thumbnail.png',
        calipers: 'quiz_assets/calipers_thumbnail.png',
        vr: 'quiz_assets/vr_thumbnail.png',
        mouse: 'quiz_assets/mouse_thumbnail.png',
        mat: 'quiz_assets/mat_thumbnail.png',
        glue: 'quiz_assets/glue_thumbnail.png',
        sewing: 'quiz_assets/sewing_thumbnail.png',
        tape: 'quiz_assets/tape_thumbnail.png',
        notepad: 'quiz_assets/notepad_thumbnail.png',
        coffee: 'quiz_assets/coffee_thumbnail.png',
        ruler: 'quiz_assets/ruler_thumbnail.png',
        thumb: 'quiz_assets/thumb_thumbnail.png',
    };

    const QUIZ_TOOL_LABELS = {
        hammer: 'Hammer',
        calipers: 'Calipers',
        vr: 'VR Headset',
        mouse: 'Mouse',
        mat: 'Cutting Mat',
        glue: 'Glue Stick',
        sewing: 'Sewing Kit',
        tape: 'Duct Tape',
        notepad: 'Notepad',
        coffee: 'Coffee',
        ruler: 'Ruler',
        thumb: 'USB Drive',
    };

    const QUIZ_TOOL_COPY = {
        ruler: {
            greeting: 'Hello, Ruler!',
            message:
                "The team's backbone — keeping everything straight, on track, and on time. Doesn't feel like you? Feel free to retake the quiz here!",
        },
        thumb: {
            greeting: 'Hello, Thumbdrive!',
            message:
                "The quiet connector who keeps everyone on the same page. Doesn't feel like you? Feel free to retake the quiz here!",
        },
        coffee: {
            greeting: 'Hello, Coffee!',
            message:
                'You show up, you fuel the team, and you do it again. Doesn\'t feel like you? Feel free to retake the quiz here!',
        },
        notepad: {
            greeting: 'Hello, Notepad!',
            message:
                'The one who captures every idea before it slips away. Doesn\'t feel like you? Feel free to retake the quiz here!',
        },
        mat: {
            greeting: 'Hello, Cutting Mat!',
            message:
                'Scratched, scored, and sliced — yet still the steadiest one standing. Doesn\'t feel like you? Feel free to retake the quiz here!',
        },
        glue: {
            greeting: 'Hello, Glue Stick!',
            message:
                'Crisis? No panic — just solutions that hold everything together. Doesn\'t feel like you? Feel free to retake the quiz here!',
        },
        sewing: {
            greeting: 'Hello, Sewing Kit!',
            message:
                'Calm, composed, and threading needles no one else dares to touch. Doesn\'t feel like you? Feel free to retake the quiz here!',
        },
        tape: {
            greeting: 'Hello, Duct Tape!',
            message:
                "Messy? Maybe. But it works, and that's what counts. Doesn't feel like you? Feel free to retake the quiz here!",
        },
        hammer: {
            greeting: 'Hello, Hammer!',
            message:
                "Done deliberating — time to commit, build, and make some noise. Doesn't feel like you? Feel free to retake the quiz here!",
        },
        calipers: {
            greeting: 'Hello, Calipers!',
            message:
                "Because 0.1mm matters, and you're the only one who checks. Doesn't feel like you? Feel free to retake the quiz here!",
        },
        vr: {
            greeting: 'Hello, Dreamer!',
            message:
                'Building whole new worlds — the vision is yours, endlessly. Doesn\'t feel like you? Feel free to retake the quiz here!',
        },
        mouse: {
            greeting: 'Hello, Mouse!',
            message:
                "Fast, precise, and always three steps ahead of everyone else. Doesn't feel like you? Feel free to retake the quiz here!",
        },
    };

    const GRADQUIZ_WIDGET_DEFAULT_COPY = {
        title: 'Try our tool quiz!',
        desc: 'Our daily choices defined who we are now. Click here to try a quiz based on a day in our life and find out your representative tool!',
    };

    function getValidQuizToolFromSession() {
        try {
            const tool = sessionStorage.getItem(QUIZ_TOOL_SESSION_KEY);
            if (tool && Object.prototype.hasOwnProperty.call(QUIZ_TOOL_IMAGES, tool)) {
                return tool;
            }
        } catch {
            /* private mode / blocked storage */
        }
        return null;
    }

    const GRADQUIZ_URL = 'gradquiz.html';
    const gradquizWidgetMobileMq = window.matchMedia('(max-width: 480px)');

    function setupGradQuizWidgetMobileTap(link) {
        const pop = link.querySelector('.gradquiz-widget__pop');
        if (!pop) return;

        function closePop() {
            link.classList.remove('is-pop-open');
            link.setAttribute('aria-expanded', 'false');
            pop.setAttribute('aria-hidden', 'true');
        }

        function openPop() {
            link.classList.add('is-pop-open');
            link.setAttribute('aria-expanded', 'true');
            pop.setAttribute('aria-hidden', 'false');
        }

        link.addEventListener('click', (e) => {
            if (!gradquizWidgetMobileMq.matches) return;

            if (!link.classList.contains('is-pop-open')) {
                e.preventDefault();
                e.stopPropagation();
                openPop();
            }
        });

        document.addEventListener('click', (e) => {
            if (!gradquizWidgetMobileMq.matches || !link.classList.contains('is-pop-open')) return;
            if (link.contains(e.target)) return;
            closePop();
        });

        const onBreakpointChange = () => {
            if (!gradquizWidgetMobileMq.matches) closePop();
        };
        if (typeof gradquizWidgetMobileMq.addEventListener === 'function') {
            gradquizWidgetMobileMq.addEventListener('change', onBreakpointChange);
        } else {
            gradquizWidgetMobileMq.addListener(onBreakpointChange);
        }
    }

    function initGradQuizWidget() {
        if (/gradquiz\.html/i.test(window.location.pathname)) return;
        if (document.querySelector('.gradquiz-widget')) return;

        const tool = getValidQuizToolFromSession();
        const copy = tool ? QUIZ_TOOL_COPY[tool] : null;
        const iconSrc = tool ? QUIZ_TOOL_IMAGES[tool] : './assets/logo_26.png';
        const iconAlt = tool
            ? `Your tool: ${QUIZ_TOOL_LABELS[tool]}`
            : 'Try our tool quiz';

        const popTitle = copy?.greeting || GRADQUIZ_WIDGET_DEFAULT_COPY.title;
        const popDesc = copy?.message || GRADQUIZ_WIDGET_DEFAULT_COPY.desc;

        const link = document.createElement('a');
        link.href = GRADQUIZ_URL;
        link.className = 'gradquiz-widget';
        link.setAttribute('aria-label', popTitle);
        link.setAttribute('aria-expanded', 'false');
        link.innerHTML = `
        <span class="gradquiz-widget__orb">
            <img class="gradquiz-widget__icon" src="${iconSrc}" alt="${iconAlt}">
        </span>
        <span class="gradquiz-widget__pop" aria-hidden="true">
            <span class="gradquiz-widget__pop-title">${popTitle}</span>
            <p class="gradquiz-widget__pop-desc">${popDesc}</p>
        </span>
    `;

        document.body.appendChild(link);
        setupGradQuizWidgetMobileTap(link);

        if (tool) {
            const preload = new Image();
            preload.src = iconSrc;
        }
    }

    window.initGradQuizWidget = initGradQuizWidget;
})();
