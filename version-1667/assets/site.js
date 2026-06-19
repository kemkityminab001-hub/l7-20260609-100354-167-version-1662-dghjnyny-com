(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-go-slide") || 0);
        show(next);
        start();
      });
    });
    var slider = document.querySelector(".hero-slider");
    if (slider) {
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
    }
    start();
  }

  function initListing() {
    var list = document.getElementById("movieList");
    if (!list) {
      return;
    }
    var search = document.getElementById("movieSearch");
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-year]"));
    var sortSelect = document.getElementById("sortSelect");
    var selectedCategory = "all";
    var selectedYear = "";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var query = normalize(search ? search.value : "");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-card"));
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-category"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var categoryMatch = selectedCategory === "all" || card.getAttribute("data-category") === selectedCategory;
        var yearMatch = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var searchMatch = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle("hidden-card", !(categoryMatch && yearMatch && searchMatch));
      });
    }

    if (search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        search.value = q;
      }
      search.addEventListener("input", applyFilters);
    }

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedCategory = button.getAttribute("data-filter-category") || "all";
        categoryButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var year = button.getAttribute("data-filter-year") || "";
        selectedYear = selectedYear === year ? "" : year;
        yearButtons.forEach(function (item) {
          item.classList.toggle("active", item.getAttribute("data-filter-year") === selectedYear);
        });
        applyFilters();
      });
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-card"));
        var mode = sortSelect.value;
        cards.sort(function (a, b) {
          if (mode === "year-desc") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          if (mode === "title-asc") {
            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
          }
          return 0;
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
      });
    }

    applyFilters();
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (video) {
      var shell = video.closest(".player-shell");
      var overlay = shell ? shell.querySelector(".player-overlay") : null;
      var stream = video.getAttribute("data-stream") || "";
      var prepared = false;
      var hlsInstance = null;

      function attach() {
        if (!stream) {
          return;
        }
        if (prepared) {
          video.play().catch(function () {});
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.play().catch(function () {});
      }

      function hideOverlay() {
        if (shell) {
          shell.classList.add("is-playing");
        }
      }

      if (overlay) {
        overlay.addEventListener("click", function () {
          attach();
          hideOverlay();
        });
      }
      video.addEventListener("play", hideOverlay);
      video.addEventListener("click", function () {
        attach();
      }, { once: true });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initListing();
    initPlayer();
  });
})();
