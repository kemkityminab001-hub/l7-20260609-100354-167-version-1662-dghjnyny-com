function initMoviePlayer(videoUrl) {
    var player = document.querySelector("[data-player]");
    var video = document.querySelector("[data-player-video]");
    var button = document.querySelector("[data-play-button]");
    var hls = null;
    var loaded = false;

    if (!player || !video || !button || !videoUrl) {
        return;
    }

    function attach() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function start() {
        attach();
        player.classList.add("is-playing");
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function() {});
        }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function() {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", function() {
        player.classList.add("is-playing");
    });
    video.addEventListener("ended", function() {
        player.classList.remove("is-playing");
    });
    window.addEventListener("pagehide", function() {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
