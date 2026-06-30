# Site Guide Chat — Implementation Plan (standalone)

**Project ID:** `SGC` (Site Guide Chat)  
**Document version:** 2.3  
**Created:** 30 June 2026  
**Updated:** 30 June 2026 — §15.0 FAQ sync; building site guide = SGC-001–007  
**Status:** **Ready for external team pickup** (no implementation started)  
**Location:** `documentation/SITE-GUIDE-CHAT-PLAN.md` (this file, inside the **contextmint-ai** repository)  
**Repository access:** **contextmint-ai only** — no product codebase (Azure DevOps) required  
**What this document is:** The **full build specification** for the site guide widget — implementing **§8 SGC-001 → SGC-007** *is* building the site guide (generator, matcher, UI, global include). Tier 3 (OpenAI) is **not** part of this build.  
**Estimated duration:** 3–5 engineering days (1 engineer), **Tier 3 (OpenAI) excluded**

---

## 0. Start here (external team checklist)

You are building a **floating help widget** on the static marketing site [contextmint.ai](https://contextmint.ai). It answers visitor questions using **only** content already on this website — no backend, no OpenAI in v1.

| Step | Action |
|------|--------|
| 0 | Confirm **`src/faq.html`** is current — see **§15.0** (updated June 2026 before site guide pickup) |
| 1 | Read **§2** (5-minute product primer) so answers stay accurate |
| 2 | Read **§3** (repo map) — every file you will touch is in this repo |
| 3 | Implement **§8** master index **SGC-001 → SGC-007** in order (see §8.1 table) |
| 4 | Run **§12** UAT table locally (`npm run dev`) |
| 5 | Open PR; request **§11** copy review from site owner before merge |
| 6 | **Do not** implement **§14** (Tier 3 / GPT) in v1 |

**Contact for copy/security questions:** `hello@contextmint.ai` (see `src/_data/site.json`).

---

## Table of contents

1. [Problem and solution](#1-problem-and-solution)  
2. [Product primer (read before writing copy)](#2-product-primer-read-before-writing-copy)  
3. [Repository map](#3-repository-map)  
4. [Build and deploy (Eleventy + GitHub Pages)](#4-build-and-deploy-eleventy--github-pages)  
5. [Goals and non-goals](#5-goals-and-non-goals)  
6. [Architecture — Tiers 1 and 2 only](#6-architecture--tiers-1-and-2-only)  
7. [Content schema and match rules](#7-content-schema-and-match-rules)  
8. [Ordered implementation (SGC-001–SGC-010)](#8-ordered-implementation-sgc-001sgc-010)  
9. [UI specification](#9-ui-specification)  
10. [Reference code (copy-paste starting points)](#10-reference-code-copy-paste-starting-points)  
11. [Forbidden claims and copy rules](#11-forbidden-claims-and-copy-rules)  
12. [Testing and acceptance](#12-testing-and-acceptance)  
13. [Rollback](#13-rollback)  
14. [Tier 3 — deferred (GPT / OpenAI)](#14-tier-3--deferred-gpt--openai)  
15. [FAQ inventory (seed content)](#15-faq-inventory-seed-content)  
15.0 [FAQ content prerequisite](#150-faq-content-prerequisite-srcfaqhtml) — read before SGC-001  
16. [Page keyword inventory (seed content)](#16-page-keyword-inventory-seed-content)  
17. [Open questions](#17-open-questions)

---

## 1. Problem and solution

### Problem

The site has many pages (`/faq.html`, `/getting-started.html`, `/docs/*`, `/trust.html`, etc.). Visitors cannot find specific answers quickly.

### Solution (v1)

A **Site guide** bubble (bottom-right) that:

1. **Tier 1:** Matches keywords → returns a **fixed FAQ answer** from JSON (instant, £0).  
2. **Tier 2:** Matches page keywords → returns **concatenated doc summaries** + links (still £0, no API).  
3. **Fallback:** No match → polite message + links to FAQ, docs, contact (**never invent an answer**).

**Tier 3 (OpenAI/GPT) is explicitly deferred** — see §14.

---

## 2. Product primer (read before writing copy)

You do **not** need to understand the product codebase. You **do** need these facts so the widget does not lie.

### What ContextMint is

- **Not:** a generic ChatGPT widget, npm library, or “copilot that writes all your code.”  
- **Is:** a **VS Code extension** + **desktop app (Engine)** for **evidence-based AI chat** with **human approval before the model runs** (Context Lens).

Tagline on site: *“Evidence-based AI decisions with human oversight.”*

### How users install (critical — common wrong assumption)

| Correct | Wrong (never say in widget) |
|---------|----------------------------|
| Download **ContextMint Engine** (desktop) | `npm install @contextmint/core` |
| Install **VS Code extension** | “Sign up for cloud only” |
| Install **Ollama** for local AI | “No local software needed” |

Install docs: `/getting-started.html`, `/docs/installation.html`.

### Pricing (critical)

| Correct | Wrong |
|---------|-------|
| **Early access waitlist** | “Free for 3 projects” |
| **Design partner** application (30-day pilot) | “Pro £15/month” |
| **Enterprise** = contact sales | Published seat pricing |

Pricing page: `/pricing.html` — *“We are not publishing seat pricing until packaging is finalized.”*

### Privacy / sovereign story

- **Default:** code and inference stay **on the user’s machine** (Ollama).  
- **Optional:** BYOK cloud (user’s own API keys) — **off by default**.  
- Trust page: `/trust.html`.

### Widget naming

| Use | Avoid |
|-----|-------|
| **Site guide** | “ContextMint AI”, “Copilot”, “Ask our GPT” |
| “Help finding docs on this website” | “Chat with your repo” (that’s the product, not this widget) |

**Required footer in widget:**

> Answers come from this website’s FAQ and docs — not from your codebase. For product chat, use the ContextMint VS Code extension.

---

## 3. Repository map

All paths are relative to the **`contextmint-ai`** repo root.

```text
contextmint-ai/
├── .eleventy.js                 # Eleventy config — passthrough copies src/assets → _site/assets
├── package.json                 # npm scripts: build, dev, gen:*
├── documentation/
│   ├── README.md
│   ├── WEBSITE-GO-LIVE.md
│   ├── GO-LIVE-CHECKLIST.md
│   └── SITE-GUIDE-CHAT-PLAN.md  # This document
├── README.md
├── src/
│   ├── _data/
│   │   ├── site.json            # Global vars: name, url, extensionName, contactEmail
│   │   └── site-guide.json      # YOU CREATE — generated FAQ + page index (SGC-001)
│   ├── _includes/
│   │   ├── nav.html
│   │   ├── footer.html
│   │   └── site-guide.html      # YOU CREATE — widget markup (SGC-004)
│   ├── _layouts/
│   │   └── base.html            # YOU EDIT — include site-guide partial + CSS/JS (SGC-006)
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css         # CSS variables — reuse for widget (§9)
│   │   │   ├── components.css   # .btn classes — reuse for source pills
│   │   │   └── site-guide.css   # YOU CREATE (SGC-004)
│   │   └── js/
│   │       ├── main.js          # Existing — announcement, navbar (do not break)
│   │       ├── site-guide-matcher.js   # YOU CREATE — pure matching logic (SGC-005)
│   │       └── site-guide.js    # YOU CREATE — UI + fetch JSON (SGC-004)
│   ├── faq.html                 # SOURCE OF TRUTH for Tier 1 answers — parse at build time
│   ├── pricing.html
│   ├── getting-started.html
│   ├── trust.html
│   └── docs/                    # SOURCE for Tier 2 page summaries
│       ├── installation.html
│       ├── context-lens-packs.html
│       └── …
└── scripts/
    ├── gen-site-guide.mjs       # YOU CREATE — builds site-guide.json (SGC-001)
    ├── site-guide-pages.mjs     # YOU CREATE — hand-curated page_keywords (SGC-003)
    └── test-site-guide-matcher.mjs  # YOU CREATE — node test runner (SGC-005)
```

**Output after build:** `_site/assets/js/*.js`, `_site/assets/data/site-guide.json` (path you choose in SGC-002).

---

## 4. Build and deploy (Eleventy + GitHub Pages)

### Prerequisites

- Node.js **18+** (24 recommended)  
- npm  

### Local development

```bash
npm install
npm run dev
# → http://localhost:8080 (Eleventy --serve, live reload)
```

### Production build

```bash
npm run build
# → writes static site to _site/
```

### How Eleventy works here

| Concept | This repo |
|---------|-----------|
| Input | `src/` |
| Output | `_site/` |
| Layouts | `src/_layouts/base.html` wraps every page |
| Data files | `src/_data/*.json` available as `site`, etc. in Liquid templates |
| Static assets | `src/assets/` copied verbatim via `addPassthroughCopy` in `.eleventy.js` |

### Deploy

- Hosted on **GitHub Pages** (static only).  
- Deploy is **manual** via GitHub Actions workflow (see `README.md`).  
- **No server-side code** runs in production — your widget must work with `fetch('/assets/data/site-guide.json')` only.

### Existing generator pattern

Other build scripts already exist (`npm run gen:settings`). Follow the same pattern:

```json
"gen:site-guide": "node scripts/gen-site-guide.mjs",
"build": "npm run gen:settings && npm run gen:site-guide && eleventy",
"test:site-guide": "node scripts/test-site-guide-matcher.mjs"
```

---

## 5. Goals and non-goals

### Goals (v1)

| # | Goal |
|---|------|
| G1 | Tier 1 FAQ: keyword → instant answer + source link |
| G2 | Tier 2: keyword → doc summaries + source links |
| G3 | 100% static — works offline after first JSON load |
| G4 | Accessible (keyboard, screen readers, focus trap) |
| G5 | Mobile-friendly bubble + panel |
| G6 | JSON built at `npm run build` from `faq.html` + curated page list |

### Non-goals (v1)

| Item | Reason |
|------|--------|
| OpenAI / GPT (**Tier 3**) | Needs server + API key — **§14 deferred** |
| Product/repo chat | Not on marketing site |
| npm install story | Product does not ship that way |
| Fake pricing | See §11 |
| Multi-turn memory | Single Q → A per send |
| Backend / serverless | GitHub Pages only |

---

## 6. Architecture — Tiers 1 and 2 only

```text
[User types message, clicks Send]
        │
        ▼
site-guide.js loads site-guide.json (once, cached in memory)
        │
        ▼
site-guide-matcher.js → matchSiteGuide(message, json)
        │
        ├─ Tier 1: predefined_faqs keyword hit?
        │       YES → { tier: "faq", answer, sources[] }
        │
        ├─ Tier 2: page_keywords hit?
        │       YES → { tier: "page_context", answer: joined summaries, sources[] }
        │
        └─ NO → { tier: "fallback", answer: fallback.message, sources: fallback.links }
```

**No network calls** except loading `site-guide.json` from the same origin.

---

## 7. Content schema and match rules

### File: `src/_data/site-guide.json`

Committed to git after generation (same pattern as `extensionSettings.json`).

```json
{
  "version": 1,
  "generated_at": "2026-06-30T12:00:00.000Z",
  "predefined_faqs": [
    {
      "id": "install-prerequisites",
      "keywords": ["install", "setup", "download", "what do i need"],
      "question": "What do I need to install?",
      "direct_answer": "Plain text only — no HTML. Max ~120 words.",
      "source_url": "/getting-started.html",
      "source_label": "Getting started"
    }
  ],
  "page_keywords": [
    {
      "page_url": "/docs/installation.html",
      "page_title": "Installation & setup",
      "keywords": ["ollama", "wizard", "prerequisites"],
      "page_summary": "One paragraph summary for Tier 2."
    }
  ],
  "fallback": {
    "message": "I couldn't find a specific match on this site. Try the links below.",
    "links": [
      { "label": "FAQ", "url": "/faq.html" },
      { "label": "Documentation", "url": "/docs/" },
      { "label": "Getting started", "url": "/getting-started.html" },
      { "label": "Request demo", "url": "/request-demo.html" }
    ]
  }
}
```

### Match rules (implement exactly)

| Rule | Behavior |
|------|----------|
| Normalization | `userMessage.trim().toLowerCase()` |
| Tier 1 | Iterate `predefined_faqs` **in array order**. First FAQ where **any** keyword is a **substring** of the message wins. |
| Tier 1 stop | Do not run Tier 2 if Tier 1 matched. |
| Tier 2 | Collect **all** `page_keywords` entries with any keyword substring match. Dedupe by `page_url`. |
| Tier 2 answer | `"From our docs:\n\n" + summaries.join("\n\n")` — no paraphrasing, no LLM. |
| Tier 2 sources | One `{ label: page_title, url: page_url }` per matched page. |
| Fallback | If no Tier 1 or Tier 2 match. |
| Keyword design | Prefer **phrases** (`"context lens"`, `"leave my machine"`) over single words (`"cost"`) |

### Response shape (all tiers)

```typescript
// Logical contract — implement in plain JS
type SiteGuideResponse = {
  answer: string;
  tier: "faq" | "page_context" | "fallback";
  sources: Array<{ label: string; url: string }>;
  matched_faq_id?: string;
};
```

---

## 8. Ordered implementation (SGC-001–SGC-010)

**Rule:** Execute rows **in order**. Do not start UI (Phase B) until Phase A produces valid `site-guide.json`. **Do not implement Phase D (Tier 3).**

### 8.1 Master step index

| Order | ID | Phase | Task | Files to create/edit | Depends on | Acceptance (one line) |
|------:|-----|-------|------|----------------------|------------|------------------------|
| 1 | **SGC-001** | A — Content | FAQ parser + JSON generator | `scripts/gen-site-guide.mjs`, `scripts/site-guide-faq-keywords.mjs`, `src/_data/site-guide.json`, `src/assets/data/site-guide.json` | — | `node scripts/gen-site-guide.mjs` → ≥22 FAQs |
| 2 | **SGC-002** | A — Content | Wire npm build | `package.json` | SGC-001 | `_site/assets/data/site-guide.json` after `npm run build` |
| 3 | **SGC-003** | A — Content | Page keyword catalog | `scripts/site-guide-pages.mjs` | SGC-001 | §16 pages in JSON; §12 UAT keywords hit |
| 4 | **SGC-005** | B — Logic | Matcher (pure JS) | `src/assets/js/site-guide-matcher.js`, `scripts/test-site-guide-matcher.mjs` | SGC-001 | `npm run test:site-guide` passes |
| 5 | **SGC-004** | B — UI | Widget markup + styles + controller | `src/_includes/site-guide.html`, `src/assets/css/site-guide.css`, `src/assets/js/site-guide.js` | SGC-005 | Panel opens; Send renders answer |
| 6 | **SGC-006** | B — UI | Global include | `src/_layouts/base.html` | SGC-004 | Bubble on `/`, `/faq.html`, `/docs/*` |
| 7 | **SGC-007** | B — UI | Source link pills | `site-guide.js` (render), `site-guide.css` | SGC-006 | Sources use `.btn.btn-sm.btn-secondary` |
| 8 | **SGC-009** | C — Review | Copy / forbidden-claims review | — | SGC-007 | Site owner sign-off §11 |
| 9 | **SGC-008** | C — Polish | Optional thumbs feedback | `site-guide.js` | SGC-007 | Optional — skip if timeboxed |
| 10 | **SGC-010** | C — Polish | Optional Pagefind search | `.eleventy.js` | SGC-007 | Optional — follow-up |

### 8.2 Phase summary

| Phase | Steps | Outcome |
|-------|-------|---------|
| **A — Content + build** | SGC-001, SGC-002, SGC-003 | `site-guide.json` built from `faq.html` + curated pages |
| **B — Widget (required)** | SGC-005 → SGC-004 → SGC-006 → SGC-007 | Live static site guide on all pages |
| **C — Polish (optional)** | SGC-008, SGC-009, SGC-010 | Review + nice-to-haves |
| **D — Tier 3 (deferred)** | SGC-FUTURE-* | **Do not implement** — §14 |

### 8.3 Day-by-day schedule (suggested)

| Day | Steps | Goal |
|-----|-------|------|
| **Day 1** | SGC-001, SGC-002, SGC-003 | Generator works; JSON committed; build emits asset |
| **Day 2** | SGC-005, start SGC-004 | Matcher tested; HTML/CSS shell |
| **Day 3** | SGC-004, SGC-006, SGC-007 | End-to-end widget on dev server |
| **Day 4** | SGC-009, §12 UAT, PR | Copy review + manual/automated tests |
| **Day 5** | Buffer / SGC-008 | Fix UAT failures; optional polish |

### 8.4 Per-step detail

#### SGC-001 — Build generator `scripts/gen-site-guide.mjs`

**Purpose:** Parse `src/faq.html` and emit `src/_data/site-guide.json`.

**Algorithm:**

1. Read `src/faq.html` as UTF-8 text.  
2. For each `<details class="faq-item">` block:  
   - Extract `<summary>...</summary>` → `question`  
   - Extract first `<p>` inside `.faq-item__body` → strip HTML tags → `direct_answer`  
   - Replace Liquid `{{ site.extensionName }}` with value from `src/_data/site.json` (`extensionName`, default `"ContextMint"`).  
3. Assign `id`: slugify question (`what-do-i-need-to-install`).  
4. Merge **keyword overrides** from `scripts/site-guide-faq-keywords.mjs` (hand-curated per FAQ id).  
5. Merge `page_keywords` from `scripts/site-guide-pages.mjs`.  
6. Write pretty-printed JSON to `src/_data/site-guide.json`.

**Also copy JSON to assets for runtime fetch:**

```javascript
// At end of gen-site-guide.mjs
const ASSET_OUT = path.join(__dirname, "../src/assets/data/site-guide.json");
fs.mkdirSync(path.dirname(ASSET_OUT), { recursive: true });
fs.writeFileSync(ASSET_OUT, JSON.stringify(payload, null, 2));
```

Create empty `src/assets/data/.gitkeep` if needed.

**Acceptance:** `node scripts/gen-site-guide.mjs` produces ≥22 FAQ entries (count of `<details class="faq-item">` in `faq.html`).

---

#### SGC-002 — Wire `package.json`

Add scripts (see §4). Ensure `npm run build` runs generator before Eleventy.

**Acceptance:** After `npm run build`, file exists at `_site/assets/data/site-guide.json`.

---

#### SGC-003 — Curated keywords `scripts/site-guide-pages.mjs`

Export `PAGE_KEYWORDS` array — full seed list in **§16**.  
Export `FAQ_KEYWORD_OVERRIDES` — map `id` → extra keywords — seed in **§15**.

**Acceptance:** UAT rows in §12 pass.

---

#### SGC-004 — Widget UI

**Files:**

- `src/_includes/site-guide.html` — markup only  
- `src/assets/css/site-guide.css` — styles (§9)  
- `src/assets/js/site-guide.js` — behavior  

**Behavior:**

1. On load: `fetch('/assets/data/site-guide.json')` → store in closure.  
2. Bubble button toggles panel.  
3. User types in `<textarea>` or `<input>`, Send button or Enter (without Shift).  
4. Call `matchSiteGuide(text, data)` from matcher script.  
5. Render answer + source pills.  
6. Show tier badge (optional, dev-only: `data-tier` attribute).  
7. Append disclosure footer (§2).  

**Acceptance:** Widget visible on homepage; panel opens/closes; answer renders.

---

#### SGC-005 — Matcher `src/assets/js/site-guide-matcher.js`

Pure functions, no DOM. Export for tests:

```javascript
export function matchSiteGuide(userMessage, siteGuide) { /* §10 */ }
```

Load in browser via `<script type="module">` or bundle into single IIFE if you prefer no modules on static host — **both work on GitHub Pages**.

**Test:** `node scripts/test-site-guide-matcher.mjs` imports matcher (use `node --experimental-vm-modules` or duplicate matcher logic in test file as CJS — team choice).

**Acceptance:** All §12 automated assertions pass.

---

#### SGC-006 — Include on all pages

Edit `src/_layouts/base.html` **before** `</body>`:

```html
  <link rel="stylesheet" href="/assets/css/site-guide.css" />
  {% include "site-guide.html" %}
  <script src="/assets/js/site-guide-matcher.js" defer></script>
  <script src="/assets/js/site-guide.js" defer></script>
```

Place **after** `main.js` so navbar still works.

**Acceptance:** Bubble on `/`, `/faq.html`, `/docs/installation.html`, `/pricing.html`.

---

#### SGC-007 — Source link rendering

Render `sources` as:

```html
<div class="site-guide__sources">
  <span class="site-guide__sources-label">Sources</span>
  <a class="btn btn-sm btn-secondary" href="...">Label</a>
</div>
```

Links open **same tab** (`target` omitted). All URLs are root-relative (`/faq.html`).

---

#### SGC-008 — Optional “Was this helpful?” (nice-to-have)

Thumbs up/down — `localStorage` only, no analytics SDK in v1.

---

#### SGC-009 — Copy review

Site owner checks §11 forbidden claims before merge.

---

#### SGC-010 — Optional Pagefind (out of v1 scope)

Full-text search plugin — follow-up if fallback rate is high.

---

## 9. UI specification

### Placement

- Fixed position: `bottom: 24px; right: 24px; z-index: 9000`  
- On mobile: full-width panel above bubble, `max-height: 70vh`

### Colors (reuse from `src/assets/css/main.css`)

```css
/* Use existing variables — do not invent new palette */
background: var(--bg-surface);
color: var(--text-primary);
border: 1px solid var(--border-default);
accent: var(--color-action);
```

### Bubble button

- 56×56px circle  
- `aria-label="Open site guide"`  
- Icon: `?` or chat SVG (inline, no external icon font required)

### Panel

- `role="dialog"`  
- `aria-modal="true"`  
- `aria-labelledby="site-guide-title"`  
- Title: **Site guide**  
- Subtitle: *Find answers on contextmint.ai*  
- Close button: `aria-label="Close site guide"`  
- **Escape** closes panel and returns focus to bubble  
- Focus trap while open (tab cycles inside panel)

### States

| State | UI |
|-------|-----|
| Loading JSON | “Loading…” in panel body |
| JSON error | “Help is temporarily unavailable.” + link to `/faq.html` |
| Empty send | Disable Send button |
| Answer | Answer text + sources + footer disclosure |

### Wireframe

```text
┌─────────────────────────────────────┐
│ Site guide                      [×] │
│ Find answers on contextmint.ai      │
├─────────────────────────────────────┤
│ [User question input          ]     │
│                          [ Send ]   │
├─────────────────────────────────────┤
│ Answer paragraph text…              │
│                                     │
│ Sources: [Getting started] [FAQ]    │
│                                     │
│ ⓘ Answers come from this website's  │
│   FAQ and docs — not your codebase. │
└─────────────────────────────────────┘
                                              ┌────┐
                                              │ ?  │  ← bubble
                                              └────┘
```

---

## 10. Reference code (copy-paste starting points)

### 10.1 `scripts/site-guide-faq-keywords.mjs`

```javascript
/** Extra keywords per FAQ id — merged by gen-site-guide.mjs */
export const FAQ_KEYWORD_OVERRIDES = {
  "install-prerequisites": ["install", "setup", "download", "need to install", "prerequisites"],
  "code-residency": ["code leave", "leave my machine", "privacy", "egress", "data residency", "sovereign"],
  "pricing-access": ["pricing", "cost", "how much", "price", "waitlist", "early access"],
  // … add one entry per FAQ id — see §15
};
```

### 10.2 `src/assets/js/site-guide-matcher.js`

```javascript
/**
 * @param {string} userMessage
 * @param {import('./site-guide.types').SiteGuideData} siteGuide
 * @returns {import('./site-guide.types').SiteGuideResponse}
 */
export function matchSiteGuide(userMessage, siteGuide) {
  const msg = (userMessage || "").trim().toLowerCase();
  if (!msg) {
    return fallbackResponse(siteGuide);
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
    answer: fb.message || "I couldn't find a specific match. Try the links below.",
    sources: fb.links || [],
  };
}
```

### 10.3 `src/_includes/site-guide.html`

```html
<div id="site-guide-root" class="site-guide" data-state="closed">
  <button
    type="button"
    id="site-guide-launcher"
    class="site-guide__launcher"
    aria-expanded="false"
    aria-controls="site-guide-panel"
    aria-label="Open site guide"
  >
    <span aria-hidden="true">?</span>
  </button>

  <div
    id="site-guide-panel"
    class="site-guide__panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="site-guide-title"
    hidden
  >
    <header class="site-guide__header">
      <div>
        <h2 id="site-guide-title" class="site-guide__title">Site guide</h2>
        <p class="site-guide__subtitle">Find answers on contextmint.ai</p>
      </div>
      <button type="button" id="site-guide-close" class="site-guide__close" aria-label="Close site guide">×</button>
    </header>

    <div class="site-guide__body">
      <label class="sr-only" for="site-guide-input">Your question</label>
      <textarea id="site-guide-input" class="site-guide__input" rows="2" placeholder="e.g. Does my code leave my machine?"></textarea>
      <button type="button" id="site-guide-send" class="btn btn-primary site-guide__send">Send</button>
      <div id="site-guide-answer" class="site-guide__answer" aria-live="polite"></div>
      <p class="site-guide__disclosure">
        Answers come from this website’s FAQ and docs — not from your codebase. For product chat, use the ContextMint VS Code extension.
      </p>
    </div>
  </div>
</div>
```

### 10.4 `src/assets/js/site-guide.js` (skeleton)

```javascript
(function () {
  "use strict";

  var JSON_URL = "/assets/data/site-guide.json";
  var siteGuideData = null;

  var launcher = document.getElementById("site-guide-launcher");
  var panel = document.getElementById("site-guide-panel");
  var closeBtn = document.getElementById("site-guide-close");
  var input = document.getElementById("site-guide-input");
  var sendBtn = document.getElementById("site-guide-send");
  var answerEl = document.getElementById("site-guide-answer");

  if (!launcher || !panel) return;

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  function renderResponse(res) {
    var html = "<p>" + escapeHtml(res.answer).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";
    if (res.sources && res.sources.length) {
      html += '<div class="site-guide__sources"><span class="site-guide__sources-label">Sources</span>';
      res.sources.forEach(function (s) {
        html += '<a class="btn btn-sm btn-secondary" href="' + escapeAttr(s.url) + '">' + escapeHtml(s.label) + "</a> ";
      });
      html += "</div>";
    }
    answerEl.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }

  function onSend() {
    var text = input.value;
    if (!siteGuideData || typeof matchSiteGuide !== "function") {
      answerEl.textContent = "Help is temporarily unavailable.";
      return;
    }
    renderResponse(matchSiteGuide(text, siteGuideData));
  }

  launcher.addEventListener("click", function () {
    panel.hidden ? openPanel() : closePanel();
  });
  closeBtn.addEventListener("click", closePanel);
  sendBtn.addEventListener("click", onSend);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  fetch(JSON_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) { siteGuideData = data; })
    .catch(function () { answerEl.textContent = "Help is temporarily unavailable. See /faq.html"; });
})();
```

**Note:** If matcher is ES module, either expose `matchSiteGuide` on `window` from a small bridge script or inline matcher in non-module file.

### 10.5 `scripts/gen-site-guide.mjs` (core parse logic)

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FAQ_KEYWORD_OVERRIDES } from "./site-guide-faq-keywords.mjs";
import { PAGE_KEYWORDS } from "./site-guide-pages.mjs";

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
    .trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function parseFaqs(html, extensionName) {
  const faqs = [];
  const re = /<details class="faq-item">([\s\S]*?)<\/details>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const block = m[1];
    const qMatch = block.match(/<summary>([\s\S]*?)<\/summary>/);
    const bodyMatch = block.match(/<div class="faq-item__body">([\s\S]*?)<\/div>/);
    if (!qMatch) continue;
    const question = stripHtml(qMatch[1]);
    const bodyHtml = bodyMatch ? bodyMatch[1] : "";
    const firstP = bodyHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    let answer = firstP ? stripHtml(firstP[1]) : stripHtml(bodyHtml);
    answer = answer.replace(/\{\{\s*site\.extensionName\s*\}\}/g, extensionName);
    const id = slugify(question);
    const overrides = FAQ_KEYWORD_OVERRIDES[id] || [];
    const autoKeywords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    faqs.push({
      id,
      keywords: [...new Set([...overrides, ...autoKeywords])],
      question,
      direct_answer: answer.slice(0, 800),
      source_url: "/faq.html",
      source_label: "FAQ",
    });
  }
  return faqs;
}

const faqHtml = fs.readFileSync(FAQ_PATH, "utf8");
const site = JSON.parse(fs.readFileSync(SITE_JSON, "utf8"));
const extensionName = site.extensionName || "ContextMint";

const payload = {
  version: 1,
  generated_at: new Date().toISOString(),
  predefined_faqs: parseFaqs(faqHtml, extensionName),
  page_keywords: PAGE_KEYWORDS,
  fallback: {
    message: "I couldn't find a specific match on this site. Try the links below.",
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
console.log("Wrote", payload.predefined_faqs.length, "FAQs");
```

**Limitation:** Generator takes **first `<p>` only** per FAQ. For multi-paragraph answers, extend parser or add `direct_answer` overrides in `site-guide-faq-keywords.mjs`.

---

## 11. Forbidden claims and copy rules

### Never state in widget answers

| Forbidden | Say instead |
|-----------|-------------|
| `npm install @contextmint/...` | Engine + VS Code extension + Ollama |
| “Free for N projects” / “£15/mo Pro” | Waitlist / design partner / contact sales |
| “Your code is uploaded to our cloud” | Default is local-first on your machine |
| “AI writes and commits code autonomously” | Human gates before inference and apply |
| “SOC 2 certified today” | “SOC 2 evidence packaging (roadmap)” |
| “Unlimited ChatGPT in the IDE” | Repo / Work / Hybrid lanes — not generic chat |

### When editing content

1. **Tier 1** text must come from `src/faq.html` (via generator) — do not maintain a separate FAQ in JS.  
2. **Tier 2** summaries must be manually verified against the linked page.  
3. Re-run `npm run gen:site-guide` after any `faq.html` change.

---

## 12. Testing and acceptance

### Automated (`npm run test:site-guide`)

| Input | Expected `tier` | Notes |
|-------|-----------------|-------|
| `does my code leave my machine` | `faq` | id contains `source-code` or similar |
| `how much does it cost` | `faq` | Must mention waitlist/design partner, not £/$ |
| `context lens` | `faq` or `page_context` | |
| `npm install` | `fallback` | Must NOT return npm instructions |
| `asdfghjkl` | `fallback` | |

### Manual UAT

- [ ] Open `npm run dev` → bubble visible on `/`  
- [ ] Chrome DevTools → Network **Offline** → FAQ question still works after JSON cached  
- [ ] Tab through widget — focus trapped in panel when open  
- [ ] Escape closes panel  
- [ ] Mobile 375px width — panel readable  
- [ ] `npm run build` → `_site/assets/data/site-guide.json` exists  
- [ ] No `openai.com` or external API requests in Network tab  
- [ ] Disclosure footer always visible  

### GATE-SGC (merge criteria)

- [ ] SGC-001 through SGC-007 complete  
- [ ] §12 automated + manual checks pass  
- [ ] Site owner copy review (§11)  
- [ ] **Tier 3 not implemented**

---

## 13. Rollback

1. Remove `{% include "site-guide.html" %}` and extra CSS/JS from `base.html`.  
2. Delete new files (or leave orphaned — harmless).  
3. `npm run build` and deploy.

---

## 14. Tier 3 — deferred (GPT / OpenAI)

**Do not implement in v1.** This section exists so a future team does not repeat discovery.

### Why deferred

| Issue | Detail |
|-------|--------|
| GitHub Pages | No server to hold `OPENAI_API_KEY` |
| Browser key | Keys in JS are public — **forbidden** |
| Hallucinations | GPT invents pricing/install steps |
| Brand | Product is local-first; site should not imply all answers use OpenAI |

### Future architecture (when product owner approves)

```text
Tiers 1–2 unchanged
Tier 3 ONLY: optional rephrase of Tier 2 context via Cloudflare Worker
  - NEVER call OpenAI when compiledContext is empty
  - NEVER “general knowledge” fallback
```

### Future pickup gate

- Security review  
- Privacy disclosure update in widget footer  
- Monthly cost cap + per-IP rate limit  
- Separate repo or Worker project — still **not** in static `contextmint-ai` bundle

---

## 15.0 FAQ content prerequisite (`src/faq.html`)

**Updated:** 30 June 2026 — align FAQ with `features.html`, paused intake on `design-partners.html` / `request-demo.html`, and `/docs/*` depth.

| Change | FAQ summary |
|--------|-------------|
| **P0** | Early access — intake **paused until end of July 2026**; forms reference-only; Getting started + GitHub issues available now |
| **P1 added** | Ask, Plan, and Agent modes |
| **P1 added** | Patch preview (gate 2) |
| **P1 added** | Quality map / Findings Store |
| **P1 added** | Context packs (`@pack`) |
| **P2** | Merged duplicate roadmap FAQs → single “What ships in v1.0 vs later roadmap?” |
| **Parser** | Support FAQ — primary answer in first `<p>` without leading `{% if %}` (optional email in second `<p>` only) |

After any future `faq.html` edit, re-run `npm run gen:site-guide` before deploy. **No separate FAQ JSON** — the HTML page is Tier 1 source of truth.

**Structural note:** Generator still uses **first `<p>` only** per FAQ. Multi-paragraph items (server offline, on-prem, early access) remain short in the widget unless SGC-001 joins all `<p>` tags or adds `direct_answer` overrides in `site-guide-faq-keywords.mjs`.

---

## 15. FAQ inventory (seed content)

Map FAQ `id` (from slugified `<summary>`) to **extra keywords**. Auto-keywords from question words are added by generator.

| FAQ summary (from faq.html) | Suggested `id` | Extra keywords |
|-----------------------------|----------------|----------------|
| What do I need to install? | `what-do-i-need-to-install` | install, setup, download, prerequisites |
| Does my source code leave my machine? | `does-my-source-code-leave-my-machine` | privacy, egress, sovereign, residency |
| What is the difference between Engine and the extension? | `what-is-the-difference-between-engine-and-the-extension` | engine vs extension, tray, localhost |
| Why is chat blocked or showing “server offline”? | `why-is-chat-blocked-or-showing-server-offline` | server offline, start all, engine |
| Can I ask non-code or planning questions in chat? | `can-i-ask-non-code-or-planning-questions-in-chat` | work lane, hybrid, planning |
| Why is chat blocked while “indexing”? | `why-is-chat-blocked-while-indexing` | indexing, blocked, readiness |
| Do I need Ollama? | `do-i-need-ollama` | ollama, local model |
| What is Context Lens? | `what-is-context-lens` | context lens, preview, gate, before inference |
| What are Ask, Plan, and Agent modes? | `what-are-ask-plan-and-agent-modes` | ask plan agent, chat mode, autonomy |
| What is patch preview (gate 2)? | `what-is-patch-preview-gate-2` | patch preview, gate 2, apply, diff, silent write |
| What is the quality map? | `what-is-the-quality-map` | quality map, findings store, clone, duplicate, governance |
| What are context packs? | `what-are-context-packs` | context pack, @pack, manifest |
| How is ContextMint different from autocomplete assistants? | `how-is-contextmint-different-from-autocomplete-assistants` | copilot, cursor, decision-control |
| Can we run a shared ContextMint server on-prem? | `can-we-run-a-shared-contextmint-server-on-prem` | on-prem, shared server, enterprise, helm |
| What is the difference between Engine and a team API server? | `what-is-the-difference-between-engine-and-a-team-api-server` | team server, kubernetes, docker |
| Can I use my own cloud API keys (BYOK)? | `can-i-use-my-own-cloud-api-keys-byok` | byok, openai, anthropic, api key |
| Can I paste screenshots in chat? | `can-i-paste-screenshots-in-chat` | screenshot, image, vision |
| What is ARGUS? | `what-is-argus` | argus, visual audit, wcag |
| What does the “30-day” design partner pilot mean? | `what-does-the-30-day-design-partner-pilot-mean` | pilot, 30 day, design partner |
| What ships in v1.0 vs later roadmap? | `what-ships-in-v1-0-vs-later-roadmap` | roadmap, v2, track b, verification engine, features |
| How do I get early access or join as a design partner? | `how-do-i-get-early-access-or-join-as-a-design-partner` | demo, waitlist, apply, intake paused, july 2026 |
| Where do I report bugs or get help? | `where-do-i-report-bugs-or-get-help` | support, bug, github issues |

Implement overrides in `scripts/site-guide-faq-keywords.mjs`.

---

## 16. Page keyword inventory (seed content)

Put in `scripts/site-guide-pages.mjs` as `export const PAGE_KEYWORDS = [ ... ]`.

| page_url | page_title | keywords (examples) | page_summary (write 1–2 sentences from page) |
|----------|------------|---------------------|-----------------------------------------------|
| `/getting-started.html` | Getting started | getting started, first steps, deploy | Engine + extension local-first install overview. |
| `/docs/installation.html` | Installation | install, ollama, wizard, prerequisites, vs code | Engine download, Ollama, extension, localhost:8000. |
| `/docs/context-lens-packs.html` | Context Lens & packs | context lens, packs, preview, gate | Pre-send evidence preview before model runs. |
| `/docs/chat-and-lanes.html` | Chat & lanes | repo lane, work lane, hybrid | Three chat lanes: Repo, Work, Hybrid. |
| `/docs/byok-enterprise.html` | BYOK & enterprise | byok, enterprise, cloud dispatch | Optional cloud keys; sovereign pilots keep cloud off. |
| `/docs/knowledge-and-governance.html` | Knowledge & governance | governance, quality map, findings | Index-time governance findings and lookup. |
| `/docs/image-evidence-argus.html` | Image evidence & ARGUS | image, screenshot, argus, vision | Paste images; ARGUS visual audit report. |
| `/docs/indexing-readiness.html` | Indexing & readiness | indexing, readiness, offline | Readiness phases and indexing behavior. |
| `/docs/settings.html` | Settings reference | settings, configuration | Extension and server settings catalog. |
| `/trust.html` | Trust & Security | trust, security, privacy, deployment | Local-first, BYOK, deployment models. |
| `/pricing.html` | Early access | pricing, waitlist, design partner | No published seat pricing; waitlist and pilots. |
| `/design-partners.html` | Design partners | design partner, pilot, 30 day | 30-day evaluation pilot program. |
| `/features.html` | Features v1.0 | features, v1, what ships | Shipped v1.0 capability list. |
| `/roadmap.html` | Roadmap | roadmap, v2, track b | v2.0 and Track B planned capabilities. |
| `/support/troubleshooting.html` | Troubleshooting | troubleshoot, error, fix, offline | Common install and runtime fixes. |

---

## 17. Open questions

| # | Question | Default |
|---|----------|---------|
| 1 | ES modules vs IIFE for matcher in browser? | IIFE + `window.matchSiteGuide` (simplest for static host) |
| 2 | Show widget on legal pages (`/privacy.html`)? | Yes — same widget everywhere |
| 3 | Revisit Tier 3? | Only if site owner approves + fallback rate high |

---

## Document history

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-30 | Initial plan (monorepo path) |
| 2.0 | 2026-06-30 | Standalone external-team edition — full implementation detail, contextmint-ai repo only |
| 2.1 | 2026-06-30 | Master ordered step index §8.1–8.3 |
| 2.2 | 2026-06-30 | Single copy under `contextmint-ai/documentation/` — no link to monorepo `documentation/` |
| 2.3 | 2026-06-30 | §15.0 FAQ prerequisite; `faq.html` P0/P1 sync; ≥22 FAQ acceptance |
