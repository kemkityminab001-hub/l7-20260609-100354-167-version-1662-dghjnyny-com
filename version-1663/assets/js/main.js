document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var siteNav = document.querySelector("[data-site-nav]");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      siteNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dots] button"));
    var current = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
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
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }
  }

  var grid = document.querySelector("[data-search-grid]");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var search = document.querySelector("[data-movie-search]");
    var category = document.querySelector("[data-category-filter]");
    var year = document.querySelector("[data-year-filter]");
    var sort = document.querySelector("[data-sort-filter]");

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var categoryValue = category ? category.value : "all";
      var yearValue = year ? year.value : "all";
      var visible = [];

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passCategory = categoryValue === "all" || cardCategory === categoryValue;
        var passYear = yearValue === "all" || cardYear === yearValue;
        var matched = passKeyword && passCategory && passYear;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible.push(card);
        }
      });

      if (sort) {
        var mode = sort.value;
        visible.sort(function (a, b) {
          if (mode === "hot") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          if (mode === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          }
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    [search, category, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
});
