(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-empty');
            image.removeAttribute('src');
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    var filterPanels = document.querySelectorAll('[data-filter-panel]');

    filterPanels.forEach(function (panel) {
        var scope = panel.closest('section') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var searchInput = panel.querySelector('[data-search-input]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var yearSelect = panel.querySelector('[data-filter-year]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var typeValue = normalize(typeSelect && typeSelect.value);
            var yearValue = normalize(yearSelect && yearSelect.value);

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var typeText = normalize(card.getAttribute('data-type'));
                var yearText = normalize(card.getAttribute('data-year'));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !typeValue || typeText.indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || yearText.indexOf(yearValue) !== -1;
                card.classList.toggle('hidden', !(matchesKeyword && matchesType && matchesYear));
            });
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-player-button]');
        var started = false;

        function attachStream() {
            if (!video || started) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            if (!stream) {
                return;
            }
            started = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            }
        }

        function startVideo() {
            attachStream();
            if (button) {
                button.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startVideo);
        }

        player.addEventListener('click', function (event) {
            if (event.target === player || event.target === video) {
                startVideo();
            }
        });
    }
})();
