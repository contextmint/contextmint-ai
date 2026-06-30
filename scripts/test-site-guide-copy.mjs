/**
 * SGC-009 — automated forbidden-claims scan for site guide content (§11).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { findForbiddenClaims } from "./site-guide-forbidden-claims.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "../src/_data/site-guide.json");
const WIDGET_HTML = path.join(__dirname, "../src/_includes/site-guide.html");

function runCopyReview() {
  if (!fs.existsSync(DATA_PATH)) {
    throw new Error("site-guide.json missing — run: npm run gen:site-guide");
  }

  const siteGuide = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const widgetHtml = fs.readFileSync(WIDGET_HTML, "utf8");
  const violations = [];

  for (const faq of siteGuide.predefined_faqs || []) {
    violations.push(
      ...findForbiddenClaims(
        faq.direct_answer,
        `FAQ answer: ${faq.id}`
      )
    );
    violations.push(
      ...findForbiddenClaims(faq.question, `FAQ question: ${faq.id}`)
    );
  }

  for (const page of siteGuide.page_keywords || []) {
    violations.push(
      ...findForbiddenClaims(
        page.page_summary,
        `Page summary: ${page.page_url}`
      )
    );
  }

  for (const block of siteGuide.settings_context || []) {
    violations.push(
      ...findForbiddenClaims(
        block.direct_answer,
        `Settings answer: ${block.id}`
      )
    );
    violations.push(
      ...findForbiddenClaims(block.question, `Settings question: ${block.id}`)
    );
  }

  violations.push(
    ...findForbiddenClaims(
      siteGuide.fallback?.message || "",
      "fallback.message"
    )
  );

  violations.push(
    ...findForbiddenClaims(widgetHtml, "site-guide.html widget copy")
  );

  console.log("site-guide copy review (§11)\n");

  if (violations.length === 0) {
    const faqCount = (siteGuide.predefined_faqs || []).length;
    const pageCount = (siteGuide.page_keywords || []).length;
    console.log(`  ok: ${faqCount} FAQ answers scanned`);
    console.log(`  ok: ${pageCount} page summaries scanned`);
    console.log("  ok: fallback message and widget disclosure");
    console.log("\n0 forbidden claims found");
    return;
  }

  console.error(`Found ${violations.length} forbidden claim(s):\n`);
  for (const v of violations) {
    console.error(`  [${v.id}] ${v.source}`);
    console.error(`    match: "${v.match}"`);
    console.error(`    reason: ${v.reason}\n`);
  }
  process.exit(1);
}

try {
  runCopyReview();
} catch (err) {
  console.error("\nFAILED:", err.message);
  process.exit(1);
}
