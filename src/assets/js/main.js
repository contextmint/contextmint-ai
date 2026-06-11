(function () {
  "use strict";

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
})();
