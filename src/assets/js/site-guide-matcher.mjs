/**
 * Pure site guide matching — topics list, FAQ + settings (scored), page context, fallback.
 */

const TOPICS_LIST_PATTERNS = [
  /list\s+(me\s+)?all\s+topics/,
  /list\s+(all\s+)?topics/,
  /all\s+topics/,
  /what\s+topics/,
  /what\s+can\s+you\s+help/,
  /what\s+do\s+you\s+cover/,
  /show\s+(me\s+)?all\s+topics/,
  /browse\s+topics/,
  /topics\s+on\s+(this\s+)?site/,
  /what\s+can\s+i\s+ask/,
  /list\s+everything/,
];

/** Exact catalog question match — beats partial keyword hits. */
const EXACT_QUESTION_SCORE = 100000;

/** Minimum score for a page keyword hit (at least one keyword matched). */
const MIN_PAGE_SCORE = 1000;

/**
 * @param {object} siteGuide
 * @returns {{ sections: Array<{ title: string, items: Array<{label: string, url: string}> }>, sources: Array<{label: string, url: string}> }}
 */
export function buildSiteTopics(siteGuide) {
  const sections = [];
  const sources = [];
  const seenPageUrls = new Set();

  const faqItems = (siteGuide.predefined_faqs || []).map((faq) => ({
    label: faq.question,
    url: faq.source_url || `/faq.html#${faq.id}`,
  }));
  if (faqItems.length) {
    sections.push({ title: "FAQ", items: faqItems });
    sources.push(...faqItems);
  }

  const pageItems = [];
  for (const page of siteGuide.page_keywords || []) {
    if (!page.page_url || seenPageUrls.has(page.page_url)) continue;
    seenPageUrls.add(page.page_url);
    const item = {
      label: page.page_title || page.page_url,
      url: page.page_url,
    };
    pageItems.push(item);
    sources.push(item);
  }
  if (pageItems.length) {
    sections.push({ title: "Docs & guides", items: pageItems });
  }

  const hubItems = [];
  for (const link of siteGuide.fallback?.links || []) {
    if (!link.url || seenPageUrls.has(link.url)) continue;
    seenPageUrls.add(link.url);
    const item = { label: link.label, url: link.url };
    hubItems.push(item);
    sources.push(item);
  }
  if (hubItems.length) {
    sections.push({ title: "Site pages", items: hubItems });
  }

  return { sections, sources };
}

export function isTopicsListQuery(message) {
  const msg = (message || "").trim().toLowerCase();
  if (!msg) return false;
  return TOPICS_LIST_PATTERNS.some((re) => re.test(msg));
}

function dedupeSources(sources) {
  const seen = new Set();
  const out = [];
  for (const s of sources || []) {
    if (!s || !s.url || seen.has(s.url)) continue;
    seen.add(s.url);
    out.push({ label: s.label || s.url, url: s.url });
  }
  return out;
}

export function normalizeQuestion(text) {
  return String(text)
    .toLowerCase()
    .replace(/[?.,"""''`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match keywords without false positives (e.g. "context" inside "contextmint").
 * Multi-word and long phrases use substring match; short single tokens use word boundaries.
 */
export function keywordMatches(msg, keyword) {
  const kw = (keyword || "").toLowerCase().trim();
  if (!kw) return false;
  if (kw.includes(" ") || kw.length >= 12) {
    return msg.includes(kw);
  }
  return new RegExp(`\\b${escapeRegex(kw)}\\b`, "i").test(msg);
}

/**
 * @param {string} msg
 * @param {string[]} keywords
 * @param {string} [question]
 */
export function scoreKeywordHits(msg, keywords, question) {
  const normMsg = normalizeQuestion(msg);
  if (question && normMsg === normalizeQuestion(question)) {
    return EXACT_QUESTION_SCORE;
  }
  const hits = (keywords || []).filter((kw) => keywordMatches(msg, kw));
  if (hits.length === 0) return 0;
  return hits.length * 1000 + hits.reduce((sum, kw) => sum + kw.length, 0);
}

/**
 * @param {string} msg
 * @param {object[]} entries
 * @returns {{ entry: object, score: number } | null}
 */
function bestScoredEntry(msg, entries) {
  let best = null;
  let bestScore = 0;

  for (const entry of entries) {
    const score = scoreKeywordHits(msg, entry.keywords, entry.question);
    if (score <= bestScore) continue;
    bestScore = score;
    best = { entry, score };
  }

  return best;
}

function buildFaqResponse(faq) {
  return {
    tier: "faq",
    answer: faq.direct_answer,
    matched_faq_id: faq.id,
    sources: [
      {
        label: faq.source_label || "Read more",
        url: faq.source_url,
      },
    ],
  };
}

function buildSettingsResponse(block) {
  return {
    tier: "page_context",
    answer: block.direct_answer,
    matched_settings_id: block.id,
    sources: dedupeSources([
      { label: block.primary_label, url: block.primary_url },
      ...(block.related_links || []),
    ]),
  };
}

function matchCatalog(msg, siteGuide) {
  const faqHit = bestScoredEntry(msg, siteGuide.predefined_faqs || []);
  const settingsHit = bestScoredEntry(msg, siteGuide.settings_context || []);

  let winner = null;
  if (faqHit && faqHit.score > 0) {
    winner = { ...faqHit, kind: "faq" };
  }
  if (settingsHit && settingsHit.score > 0) {
    if (!winner || settingsHit.score > winner.score) {
      winner = { ...settingsHit, kind: "settings" };
    } else if (settingsHit.score === winner.score && winner.kind === "settings") {
      /* keep settings */
    } else if (settingsHit.score === winner.score && faqHit) {
      /* tie — prefer FAQ narrative over settings how-to */
      winner = { ...faqHit, kind: "faq" };
    }
  }

  if (!winner || winner.score === 0) return null;

  if (winner.kind === "faq") {
    return buildFaqResponse(winner.entry);
  }
  return buildSettingsResponse(winner.entry);
}

function matchPageContext(msg, siteGuide) {
  let best = null;
  let bestScore = 0;

  for (const page of siteGuide.page_keywords || []) {
    const score = scoreKeywordHits(msg, page.keywords);
    if (score <= bestScore) continue;
    bestScore = score;
    best = page;
  }

  if (!best || bestScore < MIN_PAGE_SCORE) return null;

  return {
    tier: "page_context",
    answer: best.page_summary,
    sources: [
      {
        label: best.page_title || best.page_url,
        url: best.page_url,
      },
    ],
  };
}

/**
 * @param {string} userMessage
 * @param {object} siteGuide
 * @returns {{ answer: string, tier: string, sources: Array<{label: string, url: string}>, matched_faq_id?: string, topic_sections?: Array }}
 */
export function matchSiteGuide(userMessage, siteGuide) {
  const msg = (userMessage || "").trim().toLowerCase();
  if (!msg) {
    return fallbackResponse(siteGuide);
  }

  if (isTopicsListQuery(msg)) {
    const { sections, sources } = buildSiteTopics(siteGuide);
    return {
      tier: "topics",
      answer:
        "Here are topics covered on contextmint.ai — pick a link to read more.",
      sources,
      topic_sections: sections,
    };
  }

  const catalogMatch = matchCatalog(msg, siteGuide);
  if (catalogMatch) {
    return catalogMatch;
  }

  const pageMatch = matchPageContext(msg, siteGuide);
  if (pageMatch) {
    return pageMatch;
  }

  return fallbackResponse(siteGuide);
}

function fallbackResponse(siteGuide) {
  const fb = siteGuide.fallback || {};
  return {
    tier: "fallback",
    answer:
      fb.message ||
      "I couldn't find a specific match. Try the links below.",
    sources: fb.links || [],
  };
}
