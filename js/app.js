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

    var PRINT_WIDTH = "7.7in";
    var PRINT_HEIGHT_IN = 10.2;
    var SCALE_MIN = 0.78;
    var SCALE_MAX = 1.12;

    function printHeightPx() {
        return PRINT_HEIGHT_IN * 96;
    }

    function pageWrap() {
        return document.querySelector(".page-wrap");
    }

    function wrapHeight() {
        var el = pageWrap();
        return el ? el.getBoundingClientRect().height : 0;
    }

    function contentHeight(el) {
        var last = el.lastElementChild;
        if (!last) return 0;
        return last.getBoundingClientRect().bottom - el.getBoundingClientRect().top;
    }

    function setScale(el, value) {
        el.style.setProperty("--text-scale", String(value));
    }

    function getScale(el) {
        var raw = el.style.getPropertyValue("--text-scale");
        var n = parseFloat(raw);
        return isFinite(n) && n > 0 ? n : 1;
    }

    function maxScaleThatFits(apply, min, max) {
        var target = printHeightPx();
        var lo = min;
        var hi = max;
        var best = min;
        for (var i = 0; i < 16; i++) {
            var mid = (lo + hi) / 2;
            apply(mid);
            if (wrapHeight() <= target) {
                best = mid;
                lo = mid;
            } else {
                hi = mid;
            }
        }
        apply(best);
        return best;
    }

    function fitPrintText() {
        var wrap = pageWrap();
        var sidebar = document.querySelector(".sidebar");
        var main = document.querySelector(".main");
        if (!wrap || !sidebar || !main) return;

        wrap.style.width = PRINT_WIDTH;
        wrap.style.maxWidth = PRINT_WIDTH;

        setScale(sidebar, 1);
        setScale(main, 1);

        var shared = maxScaleThatFits(function (value) {
            setScale(sidebar, value);
            setScale(main, value);
        }, SCALE_MIN, SCALE_MAX);

        var sideH = contentHeight(sidebar);
        var mainH = contentHeight(main);
        var shorter = sideH <= mainH ? sidebar : main;
        var taller = shorter === sidebar ? main : sidebar;

        maxScaleThatFits(function (value) {
            setScale(shorter, value);
            setScale(taller, shared);
        }, shared, Math.min(SCALE_MAX, shared * 1.18));
    }

    function resetPrintText() {
        var wrap = pageWrap();
        if (wrap) {
            wrap.style.removeProperty("width");
            wrap.style.removeProperty("max-width");
        }
        document.querySelectorAll(".sidebar, .main").forEach(function (el) {
            el.style.removeProperty("--text-scale");
        });
    }

    window.addEventListener("beforeprint", fitPrintText);
    window.addEventListener("afterprint", resetPrintText);

    if (window.matchMedia) {
        var printMq = window.matchMedia("print");
        var onPrintMq = function (event) {
            if (event.matches) fitPrintText();
            else resetPrintText();
        };
        if (printMq.addEventListener) printMq.addEventListener("change", onPrintMq);
        else if (printMq.addListener) printMq.addListener(onPrintMq);
    }

    document.addEventListener("DOMContentLoaded", function () {
        initScrollReveal();
    });

    window.downloadCV = function () {
        window.print();
    };
})();
