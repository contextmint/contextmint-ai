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
  var statusRegion = form.querySelector(".form-status");
  var successPanel = form.querySelector(".form-success");

  if (inlineError && !inlineError.id) {
    inlineError.id = "demo-form-error";
  }

  function showSuccess() {
    clearFieldErrors();
    hideInlineError();
    form.classList.add("is-submitted");
    if (statusRegion) {
      statusRegion.hidden = false;
      statusRegion.textContent = "Thank you — we will be in touch.";
    }
    if (successPanel) {
      successPanel.setAttribute("tabindex", "-1");
      successPanel.focus();
    }
  }

  function showInlineError(message) {
    if (!inlineError) {
      return;
    }
    inlineError.textContent = message;
    inlineError.hidden = false;
    if (statusRegion) {
      statusRegion.hidden = false;
      statusRegion.textContent = message;
    }
  }

  function hideInlineError() {
    if (inlineError) {
      inlineError.hidden = true;
      inlineError.textContent = "";
    }
    if (statusRegion && !form.classList.contains("is-submitted")) {
      statusRegion.hidden = true;
      statusRegion.textContent = "";
    }
  }

  function clearFieldErrors() {
    form.querySelectorAll("[aria-invalid='true']").forEach(function (field) {
      field.removeAttribute("aria-invalid");
      var describedBy = field.getAttribute("aria-describedby") || "";
      if (inlineError && inlineError.id && describedBy) {
        var next = describedBy
          .split(/\s+/)
          .filter(function (id) {
            return id && id !== inlineError.id;
          })
          .join(" ");
        if (next) {
          field.setAttribute("aria-describedby", next);
        } else {
          field.removeAttribute("aria-describedby");
        }
      }
    });
  }

  function markInvalid(field, message) {
    if (!field) {
      return;
    }
    field.setAttribute("aria-invalid", "true");
    if (inlineError && inlineError.id) {
      var existing = field.getAttribute("aria-describedby") || "";
      var parts = existing.split(/\s+/).filter(Boolean);
      if (parts.indexOf(inlineError.id) === -1) {
        parts.push(inlineError.id);
      }
      field.setAttribute("aria-describedby", parts.join(" "));
    }
    showInlineError(message);
    field.focus();
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
        "Roadmap interest: " + fieldValue("roadmap-interest"),
        "",
        fieldValue("message"),
      ].join("\n")
    );
    window.location.href = "mailto:" + contactEmail + "?subject=" + subject + "&body=" + body;
    showSuccess();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFieldErrors();
    hideInlineError();

    var emailField = form.querySelector('[name="email"]');
    if (!fieldValue("email")) {
      markInvalid(emailField, "Enter a work email so we can reply.");
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
