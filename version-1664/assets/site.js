(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function text(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        start();
    }

    function initMovieFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-movie-grid]'));
        if (!grids.length) {
            return;
        }
        var keywordInput = document.querySelector('[data-movie-filter]');
        var categorySelect = document.querySelector('[data-category-filter]');
        var sortSelect = document.querySelector('[data-sort-filter]');
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (keywordInput && initialQuery) {
            keywordInput.value = initialQuery;
        }

        function filter() {
            var keyword = text(keywordInput ? keywordInput.value : '');
            var category = categorySelect ? categorySelect.value : 'all';
            var visible = 0;

            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
                cards.forEach(function (card) {
                    var haystack = text(card.getAttribute('data-search'));
                    var cardCategory = card.getAttribute('data-category');
                    var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                    var categoryMatch = category === 'all' || cardCategory === category;
                    var matched = keywordMatch && categoryMatch;
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        function sortCards() {
            if (!sortSelect) {
                return;
            }
            var mode = sortSelect.value;
            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
                cards.sort(function (a, b) {
                    if (mode === 'title') {
                        return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-CN');
                    }
                    if (mode === 'year') {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    }
                    return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
            });
            filter();
        }

        if (keywordInput) {
            keywordInput.addEventListener('input', filter);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', filter);
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', sortCards);
        }
        sortCards();
        filter();
    }

    ready(function () {
        initMenu();
        initHeroSlider();
        initMovieFilters();
    });
}());
