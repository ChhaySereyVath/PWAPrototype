// Initialize the Materialize Sidenav
document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
});

// for the offline video
document.addEventListener('DOMContentLoaded', function () {
    const youtubeVideo = document.getElementById('youtube-video');
    const offlinePlaceholder = document.getElementById('offline-placeholder');
  
    if (!youtubeVideo || !offlinePlaceholder) {
      // Suppress the warning and skip any further execution
      return;
    }
  
    function updateVideoDisplay() {
      if (navigator.onLine) {
        youtubeVideo.style.display = 'block';
        offlinePlaceholder.style.display = 'none';
      } else {
        youtubeVideo.style.display = 'none';
        offlinePlaceholder.style.display = 'block';
      }
    }
  
    updateVideoDisplay();
    window.addEventListener('online', updateVideoDisplay);
    window.addEventListener('offline', updateVideoDisplay);
  });
  