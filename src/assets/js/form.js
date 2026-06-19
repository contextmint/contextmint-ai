(function () {
  "use strict";

  var form = document.getElementById("demo-form");
  if (!form) {
    return;
  }

  var formId = form.getAttribute("data-formspree-id") || "";
  var contactEmail = form.getAttribute("data-contact-email") || "";
  var emailVisible = form.getAttribute("data-email-visible") === "true";
  var issuesUrl = form.getAttribute("data-issues-url") || "https://github.com/contextmint/contextmint/issues";
  var inlineError = form.querySelector(".form-inline-error");

  function showSuccess() {
    form.classList.add("is-submitted");
    form.setAttribute("aria-live", "polite");
    hideInlineError();
  }

  function showInlineError(message) {
    if (!inlineError) {
      return;
    }
    inlineError.textContent = message;
    inlineError.hidden = false;
  }

  function hideInlineError() {
    if (inlineError) {
      inlineError.hidden = true;
      inlineError.textContent = "";
    }
  }

  function fieldValue(name) {
    var field = form.querySelector('[name="' + name + '"]');
    return field ? String(field.value || "").trim() : "";
  }

  function openMailtoFallback() {
    if (!emailVisible || !contactEmail) {
      showInlineError(
        "Email is not available yet. Open a GitHub issue: " + issuesUrl
      );
      return;
    }
    var subject = encodeURIComponent("ContextMint inquiry — " + fieldValue("company"));
    var body = encodeURIComponent(
      [
        "Name: " + fieldValue("name"),
        "Email: " + fieldValue("email"),
        "Company: " + fieldValue("company"),
        "Role: " + fieldValue("role"),
        "Challenge: " + fieldValue("challenge"),
        "Team size: " + fieldValue("team-size"),
        "",
        fieldValue("message"),
      ].join("\n")
    );
    window.location.href = "mailto:" + contactEmail + "?subject=" + subject + "&body=" + body;
    showSuccess();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideInlineError();

    if (!fieldValue("email")) {
      var emailField = form.querySelector('[name="email"]');
      if (emailField) {
        emailField.focus();
      }
      return;
    }

    if (!formId) {
      openMailtoFallback();
      return;
    }

    var submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    fetch("https://formspree.io/f/" + formId, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fieldValue("name"),
        email: fieldValue("email"),
        company: fieldValue("company"),
        role: fieldValue("role"),
        challenge: fieldValue("challenge"),
        team_size: fieldValue("team-size"),
        message: fieldValue("message"),
        _subject: "ContextMint demo request — " + fieldValue("company"),
      }),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Form submit failed");
        }
        showSuccess();
      })
      .catch(function () {
        openMailtoFallback();
      })
      .finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  });
})();
