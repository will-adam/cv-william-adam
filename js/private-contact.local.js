// See private-contact.example for the expected variable names.
(function () {
    "use strict";

    var privateEmail = window.PRIVATE_EMAIL || '';
    var privatePhone = window.PRIVATE_PHONE || '';

    if (!privateEmail && !privatePhone) return;

    var heroContactEl = document.querySelector(".hero-contact");
    if (!heroContactEl) return;

    var heroLocationEl = heroContactEl.querySelector(".hero-location");
    if (!heroLocationEl) return;

    var privateInfoEl = document.createElement("span");
    privateInfoEl.className = "private-info";

    var html = [];
    if (privateEmail) html.push('<a href="mailto:' + privateEmail + '">' + privateEmail + '</a>');
    if (privatePhone) html.push('<a href="tel:' + privatePhone + '">' + privatePhone + '</a>');
    privateInfoEl.innerHTML = html.join("");

    heroContactEl.insertBefore(privateInfoEl, heroLocationEl);
})();
