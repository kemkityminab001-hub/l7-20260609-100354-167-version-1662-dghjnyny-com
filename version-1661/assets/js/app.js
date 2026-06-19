(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-nav-links]");

    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        menuButton.classList.toggle("is-open", open);
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
      backTop.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-catalog]")).forEach(function (catalog) {
      var input = document.querySelector("[data-filter-input='" + catalog.getAttribute("data-catalog") + "']");
      var year = document.querySelector("[data-filter-year='" + catalog.getAttribute("data-catalog") + "']");
      var type = document.querySelector("[data-filter-type='" + catalog.getAttribute("data-catalog") + "']");
      var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));
      var empty = document.querySelector("[data-empty='" + catalog.getAttribute("data-catalog") + "']");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function update() {
        var query = normalize(input ? input.value : "");
        var selectedYear = year ? year.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesText = !query || text.indexOf(query) !== -1;
          var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          var matchesType = !selectedType || card.getAttribute("data-type") === selectedType;
          var show = matchesText && matchesYear && matchesType;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", update);
          element.addEventListener("change", update);
        }
      });

      update();
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (frame) {
      var video = frame.querySelector("video");
      var overlay = frame.querySelector(".play-overlay");

      function start() {
        if (!video) {
          return;
        }

        var stream = video.getAttribute("data-stream");

        if (stream && !video.getAttribute("src") && !video._hlsAttached) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.setAttribute("src", stream);
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hlsAttached = true;
          } else {
            video.setAttribute("src", stream);
          }
        }

        frame.classList.add("playing");
        video.controls = true;
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          frame.classList.add("playing");
        });
      }
    });
  });
})();
