(function () {
  "use strict";

  var STORAGE_PREFIX = "contextmint-announcement-dismissed:";

  function initAnnouncement() {
    var bar = document.getElementById("site-announcement");
    if (!bar) {
      return;
    }

    var id = bar.getAttribute("data-announcement-id") || "default";
    var storageKey = STORAGE_PREFIX + id;
    var dismissBtn = bar.querySelector(".site-announcement__dismiss");

    function dismiss() {
      bar.classList.add("is-hidden");
      document.body.classList.remove("has-announcement");
      document.body.classList.add("announcement-dismissed");
      try {
        localStorage.setItem(storageKey, "1");
      } catch (err) {
        /* ignore quota / private mode */
      }
    }

    try {
      if (localStorage.getItem(storageKey) === "1") {
        dismiss();
        return;
      }
    } catch (err) {
      /* ignore */
    }

    if (dismissBtn) {
      dismissBtn.addEventListener("click", dismiss);
    }
  }

  initAnnouncement();
  initProductShots();
  initNavbar();
  initFaqDeepLink();

  function initProductShots() {
    document.querySelectorAll(".product-shot__img").forEach(function (img) {
      function markLoaded() {
        img.classList.add("is-loaded");
      }

      function markMissing() {
        img.classList.add("is-missing");
      }

      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markMissing);

      if (img.complete) {
        if (img.naturalWidth > 0) {
          markLoaded();
        } else {
          markMissing();
        }
      }
    });
  }

  function initNavbar() {
    var navbar = document.querySelector(".navbar");
    var toggle = document.querySelector(".navbar__toggle");
    var menu = document.getElementById("navbar-menu");

    if (!navbar || !toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = navbar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navbar.classList.contains("is-open")) {
        navbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        toggle.focus();
      }
    });
  }

  function initFaqDeepLink() {
    var list = document.querySelector(".faq-list");
    if (!list) {
      return;
    }

    function openFromHash() {
      var id = window.location.hash.replace(/^#/, "");
      if (!id) {
        return;
      }
      var el = document.getElementById(id);
      if (!el || el.tagName !== "DETAILS") {
        return;
      }
      el.open = true;
      window.requestAnimationFrame(function () {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }
})();
