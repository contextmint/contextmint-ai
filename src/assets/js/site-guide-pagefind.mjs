/**
 * SGC-010 — Pagefind full-text search when Tier 1/2 return fallback.
 */
const PAGEFIND_URL = "/pagefind/pagefind.js";
const MAX_RESULTS = 4;

let pagefindModule = null;

function stripTags(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} query
 * @returns {Promise<Array<{ url: string, title: string, excerpt: string }>>}
 */
export async function searchSitePages(query) {
  const q = (query || "").trim();
  if (!q) return [];

  try {
    if (!pagefindModule) {
      pagefindModule = await import(PAGEFIND_URL);
    }
    const response = await pagefindModule.search(q);
    const results = (response.results || []).slice(0, MAX_RESULTS);
    const data = await Promise.all(results.map((r) => r.data()));

    return data
      .map((d) => ({
        url: d.url || "",
        title: (d.meta && d.meta.title) || d.url || "Page",
        excerpt: stripTags(d.excerpt || d.content || ""),
      }))
      .filter((item) => item.url && item.excerpt);
  } catch {
    return [];
  }
}

/**
 * @param {Array<{ url: string, title: string, excerpt: string }>} hits
 * @returns {object | null}
 */
export function pagefindHitsToResponse(hits) {
  if (!hits.length) return null;

  const summaries = hits.map((h) => `${h.title}: ${h.excerpt}`);
  return {
    tier: "page_context",
    answer: "From site search:\n\n" + summaries.join("\n\n"),
    sources: hits.map((h) => ({
      label: h.title,
      url: h.url,
    })),
    via_pagefind: true,
  };
}
