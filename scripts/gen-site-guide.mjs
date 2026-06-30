/**
 * Build src/_data/site-guide.json and src/assets/data/site-guide.json from faq.html.
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
const FAQ_PATH = path.join(__dirname, "../src/faq.html");
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

function stripLiquid(html) {
  return html
    .replace(/\{%[\s\S]*?%\}/g, " ")
    .replace(/\{\{[\s\S]*?\}\}/g, " ")
    .replace(/\s+/g, " ")
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
]);

function injectFaqAnchorIds(html) {
  return html.replace(
    /<details class="faq-item"(?:\s+id="[^"]*")?>(\s*<summary>)([\s\S]*?)(<\/summary>)/g,
    (_match, openSummary, summaryInner, closeSummary) => {
      const id = slugify(stripHtml(summaryInner));
      return `<details class="faq-item" id="${id}">${openSummary}${summaryInner}${closeSummary}`;
    }
  );
}

function extractAnswerParagraphs(cleanedBody, site) {
  const paragraphs = [];
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/g;
  let pm;
  while ((pm = pRe.exec(cleanedBody)) !== null) {
    const text = applyLiquidVars(stripHtml(pm[1]), site);
    if (text) paragraphs.push(text);
  }
  if (paragraphs.length === 0) {
    return applyLiquidVars(stripHtml(cleanedBody), site);
  }
  return paragraphs.join("\n\n");
}

function parseFaqs(html, site) {
  const faqs = [];
  const re = /<details class="faq-item"(?:\s+id="[^"]*")?>([\s\S]*?)<\/details>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const block = m[1];
    const qMatch = block.match(/<summary>([\s\S]*?)<\/summary>/);
    const bodyMatch = block.match(/<div class="faq-item__body">([\s\S]*?)<\/div>/);
    if (!qMatch) continue;

    const question = stripHtml(qMatch[1]);
    const bodyHtml = bodyMatch ? bodyMatch[1] : "";
    const cleanedBody = applyLiquidVars(stripLiquid(bodyHtml), site);
    let answer = extractAnswerParagraphs(cleanedBody, site);

    const id = slugify(question);
    const overrides = FAQ_KEYWORD_OVERRIDES[id] || [];
    const autoKeywords = question
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4 && !AMBIGUOUS_AUTO_KEYWORDS.has(w));

    faqs.push({
      id,
      keywords: [...new Set([...overrides, ...autoKeywords])],
      question,
      direct_answer: answer.slice(0, 1200),
      source_url: `/faq.html#${id}`,
      source_label: question.length > 52 ? question.slice(0, 49) + "…" : question,
    });
  }
  return faqs;
}

const faqHtmlRaw = fs.readFileSync(FAQ_PATH, "utf8");
const faqHtmlWithIds = injectFaqAnchorIds(faqHtmlRaw);
if (faqHtmlWithIds !== faqHtmlRaw) {
  fs.writeFileSync(FAQ_PATH, faqHtmlWithIds);
  console.log("Synced FAQ anchor ids in", FAQ_PATH);
}
const site = JSON.parse(fs.readFileSync(SITE_JSON, "utf8"));

const payload = {
  version: 1,
  generated_at: new Date().toISOString(),
  predefined_faqs: parseFaqs(faqHtmlWithIds, site),
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
