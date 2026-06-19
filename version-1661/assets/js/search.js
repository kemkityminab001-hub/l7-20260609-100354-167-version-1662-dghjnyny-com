(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function clean(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  ready(function () {
    var input = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var movies = window.MovieIndex || [];

    if (!input || !results) {
      return;
    }

    function render(items) {
      results.innerHTML = items.map(function (item) {
        return [
          '<article class="movie-card grid">',
          '<a class="movie-cover" href="' + clean(item.url) + '" aria-label="' + clean(item.title) + '">',
          '<img src="' + clean(item.cover) + '" alt="' + clean(item.title) + '" loading="lazy">',
          '<span class="cover-shade"></span>',
          '<span class="play-mark">▶</span>',
          '<span class="year-badge">' + clean(item.year) + '</span>',
          '</a>',
          '<div class="movie-info">',
          '<div class="meta-row"><span>' + clean(item.region) + '</span><span>' + clean(item.type) + '</span></div>',
          '<h3><a href="' + clean(item.url) + '">' + clean(item.title) + '</a></h3>',
          '<p>' + clean(item.oneLine) + '</p>',
          '<div class="tag-row"><span class="mini-tag">' + clean(item.genre) + '</span></div>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");

      if (status) {
        status.textContent = items.length ? "匹配影片" : "暂无匹配影片";
      }
    }

    function search() {
      var query = input.value.trim().toLowerCase();
      var filtered = movies.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 72);
      render(filtered);
    }

    input.addEventListener("input", search);
    render(movies.slice(0, 36));
  });
})();
