// Initialize the Materialize Sidenav
document.addEventListener('DOMContentLoaded', function() {
    const elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);
});


function showCardDetails() {
    document.getElementById("card-details").style.display = "block";
}

function hideCardDetails() {
    document.getElementById("card-details").style.display = "none";
}
