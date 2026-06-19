(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function () {
    var toggle = qs('[data-mobile-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var headerSearch = qs('[data-header-search]');
    if (headerSearch) {
      headerSearch.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input', headerSearch);
        var keyword = input ? input.value.trim() : '';
        if (keyword) {
          window.location.href = './search.html?q=' + encodeURIComponent(keyword);
        }
      });
    }

    var slides = qsa('[data-hero-slide]');
    if (slides.length) {
      var dots = qsa('[data-hero-dot]');
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      };
      var prev = qs('[data-hero-prev]');
      var next = qs('[data-hero-next]');
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      setInterval(function () {
        show(current + 1);
      }, 5200);
      show(0);
    }

    var filterRoot = qs('[data-filter-root]');
    if (filterRoot) {
      var searchInput = qs('[data-filter-search]', filterRoot);
      var select = qs('[data-filter-select]', filterRoot);
      var cards = qsa('[data-card]', filterRoot);
      var empty = qs('[data-empty]', filterRoot);
      var applyFilter = function () {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var selected = select ? select.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-year')).toLowerCase();
          var genre = card.getAttribute('data-genre') || '';
          var matchText = !keyword || text.indexOf(keyword) !== -1;
          var matchGenre = !selected || genre.indexOf(selected) !== -1;
          var showCard = matchText && matchGenre;
          card.style.display = showCard ? '' : 'none';
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      };
      if (searchInput) {
        searchInput.addEventListener('input', applyFilter);
        try {
          var params = new URLSearchParams(window.location.search);
          var q = params.get('q');
          if (q) {
            searchInput.value = q;
          }
        } catch (error) {}
      }
      if (select) {
        select.addEventListener('change', applyFilter);
      }
      applyFilter();
    }
  });

  window.registerPlayer = function (videoId, overlayId, streamUrl) {
    ready(function () {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (!video || !overlay || !streamUrl) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;
      var setup = function () {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      };
      var play = function () {
        setup();
        overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      };
      overlay.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
