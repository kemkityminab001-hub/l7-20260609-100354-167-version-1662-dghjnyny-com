(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var reset = document.querySelector("[data-reset-filter]");
    if (!input && selects.length === 0) {
      return;
    }
    function getContent(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category")
      ].join(" "));
    }
    function apply() {
      var query = input ? normalize(input.value) : "";
      var filters = selects.map(function (select) {
        return {
          key: select.getAttribute("data-filter"),
          value: normalize(select.value)
        };
      }).filter(function (item) {
        return item.value;
      });
      cards.forEach(function (card) {
        var content = getContent(card);
        var matchedQuery = !query || content.indexOf(query) !== -1;
        var matchedFilters = filters.every(function (filter) {
          return normalize(card.getAttribute("data-" + filter.key)).indexOf(filter.value) !== -1;
        });
        card.classList.toggle("is-filtered-out", !(matchedQuery && matchedFilters));
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        selects.forEach(function (select) {
          select.value = "";
        });
        apply();
      });
    }
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".player-overlay");
    if (!video || !streamUrl) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }
    function showOverlay() {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }
    function startVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          showOverlay();
        });
      }
    }
    function attach() {
      hideOverlay();
      if (attached) {
        startVideo();
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        startVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          startVideo();
        });
        return;
      }
      video.src = streamUrl;
      startVideo();
    }
    if (overlay) {
      overlay.addEventListener("click", attach);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showOverlay();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
