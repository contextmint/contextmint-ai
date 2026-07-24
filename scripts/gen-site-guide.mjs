/**
 * Build src/_data/site-guide.json and src/assets/data/site-guide.json from the
 * English FAQ i18n pack (src/_i18n/en/faq.json) — the single source of truth for
 * FAQ copy since faq.html renders from i18nPageStrings.
 * Run before `eleventy` (see package.json gen:site-guide).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FAQ_KEYWORD_OVERRIDES } from "./site-guide-faq-keywords.mjs";
import { PAGE_KEYWORDS } from "./site-guide-pages.mjs";
import { SETTINGS_CONTEXT } from "./site-guide-settings-context.mjs";
import { writeSettingsQuestionsDoc } from "./gen-site-guide-settings-questions-doc.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FAQ_JSON_PATH = path.join(__dirname, "../src/_i18n/en/faq.json");
const SITE_JSON = path.join(__dirname, "../src/_data/site.json");
const OUT_DATA = path.join(__dirname, "../src/_data/site-guide.json");
const OUT_ASSET = path.join(__dirname, "../src/assets/data/site-guide.json");

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function applyLiquidVars(text, site) {
  return text
    .replace(/\{\{\s*site\.extensionName\s*\}\}/g, site.extensionName || "ContextMint")
    .replace(/\{\{\s*site\.issuesUrl\s*\}\}/g, site.issuesUrl || "")
    .replace(/\{\{\s*site\.contactEmail\s*\}\}/g, site.contactEmail || "");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** Single-word auto-keywords that cause false positives (e.g. "npm install"). */
const AMBIGUOUS_AUTO_KEYWORDS = new Set([
  "install",
  "setup",
  "download",
  "pricing",
  "cost",
  "price",
  "what",
  "does",
  "need",
  "difference",
  "between",
  "server",
  "shared",
  "contextmint",
  "context",
  "engine",
  "blocked",
  "offline",
  "indexing",
  "preview",
  "gate",
  "extension",
  "settings",
  "configure",
  "deploy",
  "screenshot",
  "image",
  "hybrid",
  "agent",
  "patch",
  "packs",
  "ollama",
  "quality",
  "planning",
]);

function extractAnswerParagraphs(paragraphsHtml, site) {
  const paragraphs = paragraphsHtml
    .map((p) => applyLiquidVars(stripHtml(p), site))
    .filter(Boolean);
  return paragraphs.join("\n\n");
}

function buildFaqEntry(id, question, paragraphsHtml, site) {
  let answer = extractAnswerParagraphs(paragraphsHtml, site);
  const overrideEntry = FAQ_KEYWORD_OVERRIDES[id] || {};
  const overrides = Array.isArray(overrideEntry)
    ? overrideEntry
    : overrideEntry.keywords || [];
  if (!Array.isArray(overrideEntry) && overrideEntry.direct_answer) {
    answer = overrideEntry.direct_answer;
  }
  const autoKeywords = question
    .toLowerCase()
    .replace(/[?.,]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !AMBIGUOUS_AUTO_KEYWORDS.has(w));

  return {
    id,
    keywords: [...new Set([...overrides, ...autoKeywords])],
    question,
    direct_answer: answer.slice(0, 1200),
    source_url: `/faq.html#${id}`,
    source_label: question.length > 52 ? question.slice(0, 49) + "…" : question,
  };
}

function parseFaqsFromPack(faqData, site) {
  const faqs = [];
  for (const item of faqData.items || []) {
    if (!item.q) continue;
    const question = stripHtml(item.q);
    const id = item.id || slugify(question);
    faqs.push(buildFaqEntry(id, question, item.body || [], site));
  }
  if (faqData.reportBugs) {
    const rb = faqData.reportBugs;
    const question = stripHtml(rb.q);
    const emailSentence = site.emailVisible
      ? ` ${rb.emailBefore} ${site.contactEmail}.`
      : "";
    const answerHtml = [
      `${rb.before} Support ${rb.mid} ${site.issuesUrl}.${emailSentence}`,
    ];
    faqs.push(
      buildFaqEntry(
        "where-do-i-report-bugs-or-get-help",
        question,
        answerHtml,
        site
      )
    );
  }
  return faqs;
}

const faqData = JSON.parse(fs.readFileSync(FAQ_JSON_PATH, "utf8"));
const site = JSON.parse(fs.readFileSync(SITE_JSON, "utf8"));

const payload = {
  version: 1,
  generated_at: new Date().toISOString(),
  predefined_faqs: parseFaqsFromPack(faqData, site),
  page_keywords: PAGE_KEYWORDS,
  settings_context: SETTINGS_CONTEXT,
  fallback: {
    message:
      "I couldn't find a specific match on this site. Try the links below.",
    links: [
      { label: "FAQ", url: "/faq.html" },
      { label: "Documentation", url: "/docs/" },
      { label: "Getting started", url: "/getting-started.html" },
      { label: "Request demo", url: "/request-demo.html" },
    ],
  },
};

fs.mkdirSync(path.dirname(OUT_ASSET), { recursive: true });
fs.writeFileSync(OUT_DATA, JSON.stringify(payload, null, 2));
fs.writeFileSync(OUT_ASSET, JSON.stringify(payload, null, 2));
console.log("Wrote", payload.predefined_faqs.length, "FAQs to", OUT_DATA);

if (payload.predefined_faqs.length < 22) {
  console.warn(
    "WARNING: expected at least 22 FAQs, got",
    payload.predefined_faqs.length
  );
  process.exitCode = 1;
}

writeSettingsQuestionsDoc();
