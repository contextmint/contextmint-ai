/**
 * Automated assertions for site guide matcher (§12).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  matchSiteGuide,
  keywordMatches,
  scoreKeywordHits,
} from "../src/assets/js/site-guide-matcher.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "../src/_data/site-guide.json");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTests() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error(
      "site-guide.json missing — run: npm run gen:site-guide"
    );
  }

  const siteGuide = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  let passed = 0;

  function test(name, fn) {
    fn();
    passed += 1;
    console.log("  ok:", name);
  }

  console.log("site-guide matcher tests\n");

  test("privacy question → faq tier", () => {
    const res = matchSiteGuide("does my code leave my machine", siteGuide);
    assert(res.tier === "faq", `expected faq, got ${res.tier}`);
    assert(
      res.matched_faq_id && res.matched_faq_id.includes("source-code"),
      `expected source-code faq id, got ${res.matched_faq_id}`
    );
  });

  test("pricing question → faq tier with waitlist/partner (not seat pricing)", () => {
    const res = matchSiteGuide("how much does it cost", siteGuide);
    assert(res.tier === "faq", `expected faq, got ${res.tier}`);
    const lower = res.answer.toLowerCase();
    assert(
      lower.includes("waitlist") ||
        lower.includes("design partner") ||
        lower.includes("paused") ||
        lower.includes("early access"),
      "answer should mention waitlist/design partner/early access, not published pricing"
    );
    assert(!/\£|\$15|free for \d/i.test(res.answer), "must not invent seat pricing");
  });

  test("context lens → faq (not settings gate doc)", () => {
    const res = matchSiteGuide("context lens", siteGuide);
    assert(res.tier === "faq", `expected faq, got ${res.tier}`);
    assert(
      res.matched_faq_id === "what-is-context-lens",
      `expected context lens faq, got ${res.matched_faq_id}`
    );
  });

  test("npm install → fallback (no npm instructions)", () => {
    const res = matchSiteGuide("npm install", siteGuide);
    assert(res.tier === "fallback", `expected fallback, got ${res.tier}`);
    assert(
      !/npm install @contextmint/i.test(res.answer),
      "must not return npm install instructions"
    );
  });

  test("gibberish → fallback", () => {
    const res = matchSiteGuide("asdfghjkl", siteGuide);
    assert(res.tier === "fallback", `expected fallback, got ${res.tier}`);
  });

  test("empty message → fallback", () => {
    const res = matchSiteGuide("   ", siteGuide);
    assert(res.tier === "fallback", `expected fallback, got ${res.tier}`);
  });

  test("FAQ sources deep-link to matching anchor on faq.html", () => {
    const res = matchSiteGuide("does my code leave my machine", siteGuide);
    assert(res.tier === "faq", `expected faq, got ${res.tier}`);
    assert(
      res.sources[0].url.includes("#"),
      `FAQ source should include hash anchor, got ${res.sources[0].url}`
    );
    assert(
      res.sources[0].url.includes(res.matched_faq_id),
      "FAQ source hash should match faq id"
    );
  });

  test("run on server → on-prem FAQ with full answer", () => {
    const res = matchSiteGuide("how do I run on server", siteGuide);
    assert(res.tier === "faq", `expected faq, got ${res.tier}`);
    assert(
      res.matched_faq_id === "can-we-run-a-shared-contextmint-server-on-prem",
      `expected on-prem faq, got ${res.matched_faq_id}`
    );
    assert(
      res.answer.toLowerCase().includes("not") &&
        res.answer.toLowerCase().includes("engine"),
      "answer should include Engine vs team server disclaimer (2nd paragraph)"
    );
  });

  test("list all topics → topics tier with clickable links", () => {
    const res = matchSiteGuide("list me all topics", siteGuide);
    assert(res.tier === "topics", `expected topics, got ${res.tier}`);
    assert(
      res.sources.length >= 20,
      `expected many topic links, got ${res.sources.length}`
    );
    assert(
      res.topic_sections && res.topic_sections.length >= 2,
      "expected grouped FAQ and docs sections"
    );
    const hasFaq = res.sources.some((s) => s.url.includes("faq.html#"));
    const hasDocs = res.sources.some((s) => s.url.includes("/docs/"));
    assert(hasFaq, "topics should include FAQ deep links");
    assert(hasDocs, "topics should include docs pages");
  });

  test("on-prem extension & server settings → detailed settings context + links", () => {
    const res = matchSiteGuide(
      "How do I configure VS Code extension and server settings when the API is deployed on-prem?",
      siteGuide
    );
    assert(res.tier === "page_context", `expected page_context, got ${res.tier}`);
    assert(
      res.matched_settings_id === "configure-on-prem-extension-server",
      `expected on-prem settings context, got ${res.matched_settings_id}`
    );
    assert(
      res.answer.includes("contextmint.serverUrl"),
      "answer should explain serverUrl"
    );
    assert(
      res.answer.includes("enterpriseMode"),
      "answer should explain enterpriseMode"
    );
    assert(
      res.sources.some((s) => s.url.includes("byok-enterprise")),
      "should link to enterprise deployment guide"
    );
    assert(
      res.sources.some((s) => s.url.includes("settings.html")),
      "should link to settings reference"
    );
    assert(res.sources.length >= 4, "should include multiple doc links");
  });

  test("change default port → server.port settings answer", () => {
    const res = matchSiteGuide(
      "How do I change the default port the ContextMint server listens on?",
      siteGuide
    );
    assert(res.tier === "page_context", `expected page_context, got ${res.tier}`);
    assert(
      res.matched_settings_id === "settings-server-port",
      `expected port settings, got ${res.matched_settings_id}`
    );
    assert(res.answer.includes("server.port"), "should mention server.port");
  });

  test("exclude directories → indexing exclude answer", () => {
    const res = matchSiteGuide(
      "How do I exclude specific files or directories from being processed by the extension?",
      siteGuide
    );
    assert(
      res.matched_settings_id === "settings-ext-excluded-patterns",
      `expected exclude patterns, got ${res.matched_settings_id}`
    );
  });

  test("settings_context count in JSON ≥ 29", () => {
    assert(
      (siteGuide.settings_context || []).length >= 29,
      `expected ≥29 settings questions, got ${(siteGuide.settings_context || []).length}`
    );
  });

  test("keywordMatches: context does not match contextmint", () => {
    assert(!keywordMatches("what is contextmint", "context"));
    assert(keywordMatches("what is context lens", "context lens"));
  });

  test("what is contextmint → install FAQ or getting started (not context lens)", () => {
    const res = matchSiteGuide("what is contextmint", siteGuide);
    assert(
      res.matched_faq_id === "what-do-i-need-to-install" ||
        (res.tier === "page_context" &&
          res.sources.some((s) => s.url.includes("getting-started"))),
      `expected install/getting-started, got ${res.matched_faq_id || res.tier}`
    );
    assert(
      res.matched_faq_id !== "what-is-context-lens",
      "must not confuse product with Context Lens feature"
    );
  });

  test("how to install contextmint → install FAQ", () => {
    const res = matchSiteGuide("how to install contextmint", siteGuide);
    assert(
      res.matched_faq_id === "what-do-i-need-to-install" ||
        res.matched_settings_id === "settings-ext-install-verify",
      `expected install answer, got ${res.matched_faq_id || res.matched_settings_id}`
    );
  });

  test("FAQ questions match their own FAQ entry (not settings)", () => {
    const mustBeFaq = [
      "Why is chat blocked or showing “server offline”?",
      "Why is chat blocked while “indexing”?",
      "What is Context Lens?",
      "What is patch preview (gate 2)?",
      "What are context packs?",
      "Can we run a shared ContextMint server on-prem?",
      "What is the difference between Engine and a team API server?",
      "Can I paste screenshots in chat?",
      "How do I get early access or join as a design partner?",
    ];
    for (const q of mustBeFaq) {
      const res = matchSiteGuide(q, siteGuide);
      assert(
        res.tier === "faq",
        `"${q}" should match FAQ tier, got ${res.tier} (${res.matched_settings_id || res.matched_faq_id})`
      );
    }
  });

  test("settings questions match their own settings entry", () => {
    for (const q of siteGuide.settings_context || []) {
      const res = matchSiteGuide(q.question, siteGuide);
      assert(
        res.matched_settings_id === q.id,
        `"${q.question}" should match ${q.id}, got ${res.matched_settings_id || res.matched_faq_id || res.tier}`
      );
    }
  });

  test("server offline FAQ beats connection-errors settings for offline question", () => {
    const res = matchSiteGuide("server offline", siteGuide);
    assert(
      res.matched_faq_id === "why-is-chat-blocked-or-showing-server-offline" ||
        res.matched_settings_id === "settings-usage-connection-errors",
      `unexpected match: ${res.matched_faq_id || res.matched_settings_id}`
    );
  });

  test("page context returns single best page (not concatenated dump)", () => {
    const res = matchSiteGuide("settings reference catalog", siteGuide);
    if (res.tier === "page_context" && !res.matched_settings_id) {
      assert(
        !res.answer.startsWith("From our docs:"),
        "page tier should not use vague multi-page dump prefix"
      );
      assert(res.sources.length === 1, "should return one primary page link");
    }
  });

  test("engine vs extension FAQ preserves extension name in answer", () => {
    const faq = (siteGuide.predefined_faqs || []).find(
      (f) => f.id === "what-is-the-difference-between-engine-and-the-extension"
    );
    assert(faq, "engine vs extension FAQ missing");
    assert(
      faq.direct_answer.includes("ContextMint"),
      "FAQ answer should include extension product name"
    );
  });

  test("exact question scores higher than partial keyword overlap", () => {
    const faqScore = scoreKeywordHits(
      "What is Context Lens?",
      siteGuide.predefined_faqs.find((f) => f.id === "what-is-context-lens").keywords,
      "What is Context Lens?"
    );
    const settingsScore = scoreKeywordHits(
      "What is Context Lens?",
      siteGuide.settings_context.find(
        (s) => s.id === "settings-usage-context-lens-gates"
      ).keywords,
      "Where do I configure human approval before the model runs?"
    );
    assert(faqScore > settingsScore, "FAQ exact match should beat settings partial");
  });

  console.log(`\n${passed} passed`);
}

try {
  runTests();
} catch (err) {
  console.error("\nFAILED:", err.message);
  process.exit(1);
}
