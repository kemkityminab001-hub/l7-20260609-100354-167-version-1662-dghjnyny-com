(function () {
window.initMoviePlayer = function (config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var overlay = document.getElementById(config.overlayId);
  var source = config.source;
  var hlsInstance = null;

  var Hls = window.Hls;

  if (!video || !button || !source) {
    return;
  }

  function hideOverlay() {
    button.classList.add('is-hidden');
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function attachSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== source) {
        video.src = source;
      }
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }
      return Promise.resolve();
    }

    video.src = source;
    return Promise.resolve();
  }

  function playVideo() {
    attachSource().then(function () {
      hideOverlay();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    });
  }

  button.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', hideOverlay);
};
})();
