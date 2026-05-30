(function () {
    const openBtn = document.getElementById('showcase-map-open');
    const lightbox = document.getElementById('exhibition-map-lightbox');
    if (!openBtn || !lightbox) return;

    const closeBtn = lightbox.querySelector('.exhibition-map-lightbox__close');
    const content = lightbox.querySelector('.exhibition-map-lightbox__content');

    function isOpen() {
        return !lightbox.hidden;
    }

    function openLightbox() {
        lightbox.hidden = false;
        document.body.classList.add('exhibition-map-lightbox-open');
        closeBtn?.focus();
    }

    function closeLightbox() {
        if (!isOpen()) return;
        lightbox.hidden = true;
        document.body.classList.remove('exhibition-map-lightbox-open');
        openBtn.focus();
    }

    openBtn.addEventListener('click', openLightbox);

    closeBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
    });

    content?.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen()) {
            closeLightbox();
        }
    });
})();
