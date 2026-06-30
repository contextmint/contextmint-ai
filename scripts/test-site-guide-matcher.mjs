/**
 * Automated assertions for site guide matcher (§12).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { matchSiteGuide } from "../src/assets/js/site-guide-matcher.mjs";

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

  test("context lens → faq or page_context", () => {
    const res = matchSiteGuide("context lens", siteGuide);
    assert(
      res.tier === "faq" || res.tier === "page_context",
      `expected faq or page_context, got ${res.tier}`
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
      "How do I configure vsCode Extension & Server settings when api is deployed on-prem",
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

  console.log(`\n${passed} passed`);
}

try {
  runTests();
} catch (err) {
  console.error("\nFAILED:", err.message);
  process.exit(1);
}
