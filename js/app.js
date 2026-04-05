(function () {
    "use strict";

    var isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";

    if (isLocalhost) {
        document.documentElement.classList.add("is-localhost");
    }

    /* ── Private contact info (local only) ── */
    if (isLocalhost) {
        var isEn = location.pathname.indexOf("/en/") !== -1;
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = (isEn ? "../" : "") + "css/private.css";
        document.head.appendChild(link);

        var prefix = isEn ? "../" : "";
        function loadPrivateContact() {
            var privateScript = document.createElement("script");
            privateScript.src = prefix + "js/private-contact.local.js";
            document.head.appendChild(privateScript);
        }
        fetch(prefix + "private-contact.local")
            .then(function (res) { return res.text(); })
            .then(function (text) {
                text.split("\n").forEach(function (line) {
                    var trimmed = line.trim();
                    if (!trimmed || trimmed.charAt(0) === "#") return;
                    var eq = trimmed.indexOf("=");
                    if (eq === -1) return;
                    var key = trimmed.slice(0, eq).trim();
                    var val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
                    window[key] = val;
                });
            })
            .catch(function () { })
            .then(loadPrivateContact);
    }

    /* ── Scroll reveal ── */
    function initScrollReveal() {
        var timers = new WeakMap();

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var el = entry.target;
                var delay = parseInt(el.dataset.delay || 0, 10);

                if (entry.isIntersecting) {
                    var pending = timers.get(el);
                    if (pending) clearTimeout(pending);

                    timers.set(el, setTimeout(function () {
                        el.classList.add("reveal");
                        el.classList.add("visible");
                        timers.delete(el);
                    }, delay));
                } else {
                    var pending = timers.get(el);
                    if (pending) {
                        clearTimeout(pending);
                        timers.delete(el);
                    }
                    el.classList.remove("reveal");
                    el.classList.remove("visible");
                }
            });
        }, { threshold: 0.08 });

        document.querySelectorAll(".sidebar-section").forEach(function (el, i) {
            el.dataset.delay = i * 80;
            observer.observe(el);
        });

        document.querySelectorAll(".main > .section").forEach(function (el, i) {
            el.dataset.delay = i * 100;
            observer.observe(el);
        });

        document.querySelectorAll(".timeline-item").forEach(function (el, i) {
            el.dataset.delay = i * 120;
            observer.observe(el);
        });

        document.querySelectorAll(".edu-item").forEach(function (el, i) {
            el.dataset.delay = i * 80;
            observer.observe(el);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initScrollReveal();
    });

    window.downloadCV = function () {
        window.print();
    };
})();
