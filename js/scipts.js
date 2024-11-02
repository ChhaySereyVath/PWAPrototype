// Initialize the Materialize Sidenav
document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
});

// card details payment
function showCardDetails() {
    document.getElementById("card-details").style.display = "block";
}

function hideCardDetails() {
    document.getElementById("card-details").style.display = "none";
}

// for the offline video
document.addEventListener('DOMContentLoaded', function() {
    const youtubeVideo = document.getElementById('youtube-video');
    const offlinePlaceholder = document.getElementById('offline-placeholder');

    function updateVideoDisplay() {
        if (navigator.onLine) {
            youtubeVideo.style.display = 'block';
            offlinePlaceholder.style.display = 'none';
        } else {
            youtubeVideo.style.display = 'none';
            offlinePlaceholder.style.display = 'block';
        }
    }

    // Initial check
    updateVideoDisplay();

    // Listen for changes in network status
    window.addEventListener('online', updateVideoDisplay);
    window.addEventListener('offline', updateVideoDisplay);
});
