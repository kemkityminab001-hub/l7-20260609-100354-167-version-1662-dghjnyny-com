(function() {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function bindMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function() {
                show(index + 1);
                play();
            });
        }
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
                play();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function bindFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function(form) {
            var input = form.querySelector("[data-filter-input]");
            var grid = document.querySelector("[data-filter-grid]");
            var empty = document.querySelector("[data-empty-state]");
            if (!input || !grid) {
                return;
            }

            if (document.querySelector("[data-search-page]")) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q") || "";
                input.value = q;
            }

            function apply() {
                var q = normalize(input.value);
                var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
                var visible = 0;
                cards.forEach(function(card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" "));
                    var ok = !q || text.indexOf(q) !== -1;
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            input.addEventListener("input", apply);
            form.addEventListener("submit", function(event) {
                if (form.hasAttribute("data-filter-form")) {
                    apply();
                    if (!document.querySelector("[data-search-page]")) {
                        event.preventDefault();
                    }
                }
            });
            apply();
        });
    }

    ready(function() {
        bindMenu();
        bindHero();
        bindFilters();
    });
})();
