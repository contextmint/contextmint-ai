import { matchSiteGuide } from "./site-guide-matcher.mjs";
import {
  searchSitePages,
  pagefindHitsToResponse,
} from "./site-guide-pagefind.mjs";

const JSON_URL = "/assets/data/site-guide.json";
const FEEDBACK_PREFIX = "site-guide-feedback:";
const CHAT_STORAGE_KEY = "site-guide-chat-history";
const MAX_TURNS = 30;

const launcher = document.getElementById("site-guide-launcher");
const panel = document.getElementById("site-guide-panel");
const closeBtn = document.getElementById("site-guide-close");
const clearBtn = document.getElementById("site-guide-clear");
const input = document.getElementById("site-guide-input");
const sendBtn = document.getElementById("site-guide-send");
const threadEl = document.getElementById("site-guide-thread");
const root = document.getElementById("site-guide-root");

if (
  !launcher ||
  !panel ||
  !closeBtn ||
  !clearBtn ||
  !input ||
  !sendBtn ||
  !threadEl
) {
  /* Widget markup missing — skip init */
} else {
  let siteGuideData = null;
  let jsonLoaded = false;
  let focusTrapHandler = null;
  let isSending = false;
  /** @type {Array<{ query: string, response: object }>} */
  let chatHistory = [];

  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function feedbackStorageKey(query, res) {
    const parts = [
      res.tier || "unknown",
      res.matched_faq_id || "",
      query.toLowerCase().trim(),
    ];
    return FEEDBACK_PREFIX + parts.join("|");
  }

  function readFeedback(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeFeedback(key, vote) {
    try {
      localStorage.setItem(key, vote);
    } catch {
      /* quota / private mode */
    }
  }

  function loadChatHistory() {
    try {
      const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (turn) =>
          turn &&
          typeof turn.query === "string" &&
          turn.response &&
          typeof turn.response.answer === "string"
      );
    } catch {
      return [];
    }
  }

  function saveChatHistory() {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
    } catch {
      /* quota / private mode */
    }
    updateClearVisibility();
  }

  function clearChatHistory() {
    chatHistory = [];
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    threadEl.innerHTML = "";
    threadEl.className = "site-guide__thread";
    updateClearVisibility();
  }

  function updateClearVisibility() {
    clearBtn.hidden = chatHistory.length === 0;
  }

  function getFocusableElements() {
    return Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === input
    );
  }

  function trapFocus(e) {
    if (panel.hidden || e.key !== "Tab") return;
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function scrollThreadToBottom() {
    const wrap = panel.querySelector(".site-guide__thread-wrap");
    if (wrap) {
      wrap.scrollTop = wrap.scrollHeight;
    }
  }

  function renderTopicSectionsHtml(res) {
    const sections = res.topic_sections || [];
    if (!sections.length && res.sources && res.sources.length) {
      let html = '<ul class="site-guide__topic-list">';
      for (const item of res.sources) {
        html +=
          '<li><a href="' +
          escapeAttr(item.url) +
          '">' +
          escapeHtml(item.label) +
          "</a></li>";
      }
      html += "</ul>";
      return html;
    }

    let html = "";
    for (const section of sections) {
      html +=
        '<div class="site-guide__topic-section">' +
        '<p class="site-guide__topic-section-title">' +
        escapeHtml(section.title) +
        "</p>" +
        '<ul class="site-guide__topic-list">';
      for (const item of section.items || []) {
        html +=
          '<li><a href="' +
          escapeAttr(item.url) +
          '">' +
          escapeHtml(item.label) +
          "</a></li>";
      }
      html += "</ul></div>";
    }
    return html;
  }

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (root) root.setAttribute("data-state", "open");
    focusTrapHandler = trapFocus;
    document.addEventListener("keydown", focusTrapHandler);
    renderThread();
    input.focus();
    if (!jsonLoaded && chatHistory.length === 0) {
      threadEl.textContent = "Loading…";
      threadEl.className = "site-guide__thread site-guide__thread--loading";
    }
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    if (root) root.setAttribute("data-state", "closed");
    if (focusTrapHandler) {
      document.removeEventListener("keydown", focusTrapHandler);
      focusTrapHandler = null;
    }
    launcher.focus();
  }

  function updateSendState() {
    const hasText = input.value.trim().length > 0;
    sendBtn.disabled = !hasText || !jsonLoaded || isSending;
  }

  function formatAnswerHtml(answer) {
    return (
      "<p>" +
      escapeHtml(answer)
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>") +
      "</p>"
    );
  }

  function renderFeedbackHtml(query, res) {
    const key = feedbackStorageKey(query, res);
    const existing = readFeedback(key);

    if (existing === "up" || existing === "down") {
      return (
        '<p class="site-guide__feedback-thanks" role="status">Thanks for your feedback.</p>'
      );
    }

    return (
      '<div class="site-guide__feedback" data-feedback-key="' +
      escapeAttr(key) +
      '">' +
      '<span class="site-guide__feedback-label">Was this helpful?</span>' +
      '<div class="site-guide__feedback-actions">' +
      '<button type="button" class="btn btn-sm btn-secondary site-guide__feedback-btn" data-vote="up" aria-label="Yes, helpful">Yes</button>' +
      '<button type="button" class="btn btn-sm btn-secondary site-guide__feedback-btn" data-vote="down" aria-label="No, not helpful">No</button>' +
      "</div></div>"
    );
  }

  function renderTurnHtml(query, res, options) {
    const loading = options && options.loading;
    let html =
      '<article class="site-guide__turn">' +
      '<p class="site-guide__question">You asked: <span>' +
      escapeHtml(query) +
      "</span></p>";

    if (loading) {
      html +=
        '<div class="site-guide__answer site-guide__answer--loading">Searching this site…</div>';
    } else {
      let answerBlock = formatAnswerHtml(res.answer);
      if (res.tier === "topics") {
        answerBlock += renderTopicSectionsHtml(res);
      } else if (res.sources && res.sources.length) {
        answerBlock +=
          '<div class="site-guide__sources"><span class="site-guide__sources-label">Sources</span>';
        for (const s of res.sources) {
          answerBlock +=
            '<a class="btn btn-sm btn-secondary" href="' +
            escapeAttr(s.url) +
            '">' +
            escapeHtml(s.label) +
            "</a>";
        }
        answerBlock += "</div>";
      }
      answerBlock += renderFeedbackHtml(query, res);
      const tierAttr = res.tier ? ' data-tier="' + escapeAttr(res.tier) + '"' : "";
      const pfAttr = res.via_pagefind ? ' data-via-pagefind="true"' : "";
      html +=
        '<div class="site-guide__answer"' + tierAttr + pfAttr + ">" + answerBlock + "</div>";
    }

    html += "</article>";
    return html;
  }

  function attachFeedbackHandlers() {
    threadEl.querySelectorAll(".site-guide__feedback").forEach((block) => {
      const key = block.getAttribute("data-feedback-key");
      block.querySelectorAll(".site-guide__feedback-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const vote = btn.getAttribute("data-vote");
          if (!vote || !key) return;
          writeFeedback(key, vote);
          block.outerHTML =
            '<p class="site-guide__feedback-thanks" role="status">Thanks for your feedback.</p>';
        });
      });
    });
  }

  function renderThread(pendingQuery) {
    if (chatHistory.length === 0 && !pendingQuery) {
      threadEl.innerHTML = "";
      threadEl.className = "site-guide__thread";
      return;
    }

    let html = "";
    for (const turn of chatHistory) {
      html += renderTurnHtml(turn.query, turn.response);
    }
    if (pendingQuery) {
      html += renderTurnHtml(pendingQuery, { answer: "", tier: "fallback" }, { loading: true });
    }

    threadEl.innerHTML = html;
    threadEl.className = "site-guide__thread";
    attachFeedbackHandlers();
    scrollThreadToBottom();
  }

  async function resolveResponse(text) {
    let res = matchSiteGuide(text, siteGuideData);
    if (res.tier === "fallback") {
      const hits = await searchSitePages(text);
      const searchRes = pagefindHitsToResponse(hits);
      if (searchRes) {
        res = searchRes;
      }
    }
    return res;
  }

  async function onSend() {
    const text = input.value.trim();
    if (!text || isSending) return;

    if (!siteGuideData) {
      threadEl.innerHTML =
        '<p class="site-guide__answer site-guide__answer--error">Help is temporarily unavailable.</p>';
      return;
    }

    isSending = true;
    updateSendState();
    renderThread(text);

    const res = await resolveResponse(text);

    chatHistory.push({ query: text, response: res });
    if (chatHistory.length > MAX_TURNS) {
      chatHistory = chatHistory.slice(-MAX_TURNS);
    }
    saveChatHistory();

    input.value = "";
    isSending = false;
    updateSendState();
    renderThread();
  }

  launcher.addEventListener("click", () => {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  closeBtn.addEventListener("click", closePanel);

  clearBtn.addEventListener("click", () => {
    clearChatHistory();
    input.focus();
  });

  sendBtn.addEventListener("click", () => {
    onSend();
  });

  input.addEventListener("input", updateSendState);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) onSend();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });

  chatHistory = loadChatHistory();
  updateClearVisibility();

  fetch(JSON_URL)
    .then((r) => {
      if (!r.ok) throw new Error("fetch failed");
      return r.json();
    })
    .then((data) => {
      siteGuideData = data;
      jsonLoaded = true;
      updateSendState();
      if (!panel.hidden) {
        renderThread();
      } else if (chatHistory.length > 0) {
        threadEl.innerHTML = "";
        threadEl.className = "site-guide__thread";
      }
    })
    .catch(() => {
      threadEl.innerHTML =
        '<p class="site-guide__answer site-guide__answer--error">Help is temporarily unavailable. See <a href="/faq.html">FAQ</a>.</p>';
    });
}
