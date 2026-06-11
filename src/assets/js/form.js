(function () {
  "use strict";

  var form = document.getElementById("demo-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var email = form.querySelector('[name="email"]');
    if (email && !email.value.trim()) {
      email.focus();
      return;
    }

    form.classList.add("is-submitted");
    form.setAttribute("aria-live", "polite");
  });
})();
