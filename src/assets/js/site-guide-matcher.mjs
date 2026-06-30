/**
 * Pure site guide matching — topics list, Tier 1 FAQ, Tier 2 page context, fallback.
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

function matchSettingsContext(msg, siteGuide) {
  for (const block of siteGuide.settings_context || []) {
    const keywords = block.keywords || [];
    if (keywords.some((kw) => kw && msg.includes(kw.toLowerCase()))) {
      const sources = dedupeSources([
        { label: block.primary_label, url: block.primary_url },
        ...(block.related_links || []),
      ]);
      return {
        tier: "page_context",
        answer: block.direct_answer,
        matched_settings_id: block.id,
        sources,
      };
    }
  }
  return null;
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

  const settingsMatch = matchSettingsContext(msg, siteGuide);
  if (settingsMatch) {
    return settingsMatch;
  }

  for (const faq of siteGuide.predefined_faqs || []) {
    const keywords = faq.keywords || [];
    if (keywords.some((kw) => kw && msg.includes(kw.toLowerCase()))) {
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
  }

  const matchedPages = [];
  const seen = new Set();
  for (const page of siteGuide.page_keywords || []) {
    const keywords = page.keywords || [];
    const hit = keywords.some((kw) => kw && msg.includes(kw.toLowerCase()));
    if (hit && page.page_url && !seen.has(page.page_url)) {
      seen.add(page.page_url);
      matchedPages.push(page);
    }
  }

  if (matchedPages.length > 0) {
    const summaries = matchedPages.map((p) => p.page_summary).filter(Boolean);
    return {
      tier: "page_context",
      answer: "From our docs:\n\n" + summaries.join("\n\n"),
      sources: matchedPages.map((p) => ({
        label: p.page_title || p.page_url,
        url: p.page_url,
      })),
    };
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
