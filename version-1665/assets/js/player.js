(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
        var video = player.querySelector('[data-video]');
        var playButton = player.querySelector('[data-play]');
        var source = player.getAttribute('data-source');
        var hlsInstance = null;
        var loaded = false;

        var attachSource = function () {
            if (!video || !source || loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        };

        var start = function () {
            attachSource();
            if (playButton) {
                playButton.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (playButton) {
                        playButton.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (playButton) {
            playButton.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('play', function () {
                if (playButton) {
                    playButton.classList.add('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                attachSource();
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    });
})();
