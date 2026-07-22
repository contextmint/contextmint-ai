(function () {
  "use strict";

  var DEFAULTS = {
    enabled: true,
    minSelectionLength: 8,
    lang: "en-GB",
    offsetX: 8,
    offsetY: -44,
    zIndex: 1200,
  };

  var config = loadConfig();
  if (!config.enabled || typeof window.speechSynthesis === "undefined") {
    return;
  }

  var button = null;
  var currentText = "";
  var speaking = false;
  var hideTimer = null;
  var preferredVoice = null;

  init();

  function loadConfig() {
    var merged = {};
    var key;
    for (key in DEFAULTS) {
      if (Object.prototype.hasOwnProperty.call(DEFAULTS, key)) {
        merged[key] = DEFAULTS[key];
      }
    }

    var el = document.getElementById("select-to-speak-config");
    if (!el) {
      return merged;
    }

    if (el.getAttribute("data-enabled") != null) {
      merged.enabled = el.getAttribute("data-enabled") !== "false";
    }

    var minLength = Number(el.getAttribute("data-min-selection-length"));
    if (!Number.isNaN(minLength) && minLength >= 1) {
      merged.minSelectionLength = minLength;
    }

    var lang = el.getAttribute("data-lang");
    if (lang) {
      merged.lang = lang;
    }

    var offsetX = Number(el.getAttribute("data-offset-x"));
    if (!Number.isNaN(offsetX)) {
      merged.offsetX = offsetX;
    }

    var offsetY = Number(el.getAttribute("data-offset-y"));
    if (!Number.isNaN(offsetY)) {
      merged.offsetY = offsetY;
    }

    var zIndex = Number(el.getAttribute("data-z-index"));
    if (!Number.isNaN(zIndex) && zIndex > 0) {
      merged.zIndex = zIndex;
    }

    return merged;
  }

  function init() {
    button = createButton();
    document.body.appendChild(button);

    document.addEventListener("mouseup", scheduleSelectionUpdate);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("selectionchange", scheduleSelectionUpdate);
    document.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("keydown", onGlobalKeyDown);

    if (typeof speechSynthesis !== "undefined" && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = cachePreferredVoice;
    }
    cachePreferredVoice();
  }

  function createButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "select-to-speak-btn";
    btn.className = "select-to-speak";
    btn.setAttribute("aria-label", "Read selection aloud");
    btn.setAttribute("title", "Read selection aloud");
    btn.hidden = true;
    btn.style.zIndex = String(config.zIndex);
    btn.innerHTML =
      '<svg class="select-to-speak__icon select-to-speak__icon--speaker" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M11 5L6 9H3v6h3l5 4V5z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/>' +
      '<path d="M15.5 8.5a4.5 4.5 0 0 1 0 7M18 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' +
      "</svg>" +
      '<svg class="select-to-speak__icon select-to-speak__icon--stop" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/>' +
      "</svg>";
    btn.addEventListener("mousedown", function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleSpeak();
    });
    return btn;
  }

  function scheduleSelectionUpdate() {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(updateFromSelection, 0);
  }

  function onKeyUp(event) {
    if (event.key === "Shift" || event.key.indexOf("Arrow") === 0) {
      scheduleSelectionUpdate();
    }
  }

  function onViewportChange() {
    if (button.hidden) {
      return;
    }
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      hideButton();
      return;
    }
    positionButton(selection.getRangeAt(0));
  }

  function onGlobalKeyDown(event) {
    if (event.key === "Escape") {
      stopSpeaking();
      hideButton();
      return;
    }

    if (event.altKey && !event.ctrlKey && !event.metaKey && (event.key === "r" || event.key === "R")) {
      var text = getEligibleSelectionText();
      if (!text) {
        return;
      }
      event.preventDefault();
      currentText = text;
      showButtonForCurrentSelection();
      speakText(text);
    }
  }

  function updateFromSelection() {
    var text = getEligibleSelectionText();
    if (!text) {
      if (!speaking) {
        hideButton();
      }
      return;
    }
    currentText = text;
    showButtonForCurrentSelection();
  }

  function getEligibleSelectionText() {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return "";
    }

    var range = selection.getRangeAt(0);
    if (isExcludedNode(range.commonAncestorContainer)) {
      return "";
    }

    var text = String(selection.toString() || "").replace(/\s+/g, " ").trim();
    if (text.length < config.minSelectionLength) {
      return "";
    }
    return text;
  }

  function isExcludedNode(node) {
    var el = node && node.nodeType === 3 ? node.parentElement : node;
    if (!el || !el.closest) {
      return false;
    }
    return Boolean(
      el.closest(
        "input, textarea, select, [contenteditable='true'], [data-no-speak], #select-to-speak-btn, .site-guide, .navbar__toggle"
      )
    );
  }

  function showButtonForCurrentSelection() {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      hideButton();
      return;
    }
    positionButton(selection.getRangeAt(0));
    button.hidden = false;
  }

  function positionButton(range) {
    var rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      hideButton();
      return;
    }

    var top = rect.top + config.offsetY;
    var left = rect.right + config.offsetX;
    var btnWidth = 40;
    var btnHeight = 40;
    var maxLeft = window.innerWidth - btnWidth - 8;
    var maxTop = window.innerHeight - btnHeight - 8;

    if (left > maxLeft) {
      left = Math.max(8, rect.left - btnWidth - 8);
    }
    if (left < 8) {
      left = 8;
    }
    if (top < 8) {
      top = Math.min(maxTop, rect.bottom + 8);
    }
    if (top > maxTop) {
      top = maxTop;
    }

    button.style.top = Math.round(top) + "px";
    button.style.left = Math.round(left) + "px";
  }

  function hideButton() {
    button.hidden = true;
    if (!speaking) {
      currentText = "";
    }
  }

  function toggleSpeak() {
    if (speaking) {
      stopSpeaking();
      return;
    }
    var text = currentText || getEligibleSelectionText();
    if (!text) {
      return;
    }
    currentText = text;
    speakText(text);
  }

  function speakText(text) {
    stopSpeaking();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = function () {
      speaking = true;
      button.classList.add("is-speaking");
      button.setAttribute("aria-label", "Stop reading");
      button.setAttribute("title", "Stop reading");
    };

    utterance.onend = function () {
      speaking = false;
      button.classList.remove("is-speaking");
      button.setAttribute("aria-label", "Read selection aloud");
      button.setAttribute("title", "Read selection aloud");
      if (!getEligibleSelectionText()) {
        hideButton();
      }
    };

    utterance.onerror = function () {
      speaking = false;
      button.classList.remove("is-speaking");
      button.setAttribute("aria-label", "Read selection aloud");
      button.setAttribute("title", "Read selection aloud");
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window.speechSynthesis === "undefined") {
      return;
    }
    window.speechSynthesis.cancel();
    speaking = false;
    if (button) {
      button.classList.remove("is-speaking");
      button.setAttribute("aria-label", "Read selection aloud");
      button.setAttribute("title", "Read selection aloud");
    }
  }

  function cachePreferredVoice() {
    if (typeof window.speechSynthesis === "undefined") {
      return;
    }
    var voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) {
      preferredVoice = null;
      return;
    }

    var lang = config.lang.toLowerCase();
    var langPrefix = lang.split("-")[0];
    preferredVoice =
      voices.find(function (voice) {
        return voice.lang && voice.lang.toLowerCase() === lang;
      }) ||
      voices.find(function (voice) {
        return voice.lang && voice.lang.toLowerCase().indexOf(langPrefix) === 0;
      }) ||
      null;
  }
})();
