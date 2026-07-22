# WCAG 2.2 AA — marketing site audit baseline

**Scope:** [contextmint.ai](https://contextmint.ai) (this Eleventy site only).  
**Target:** WCAG 2.2 Level AA.  
**Date:** 22 July 2026.  
**Method:** Code review against WCAG 2.2 AA + remediation tracked in this programme. Automated axe runs via `npm run test:a11y` after build.

## Strengths already present

- Landmarks (`main#main-content`, labelled nav/footer/docs sidebars)
- Mobile menu: `aria-expanded`, Escape restores focus
- Site guide: dialog, focus trap, `aria-live`, labelled controls
- Carousels: pause on hover/focus, `prefers-reduced-motion` stops autoplay
- Forms: visible labels, `autocomplete` attributes
- Select-to-speak: labelled control, Escape stop

## Findings mapped to success criteria

| ID | Finding | SC | Severity | Remediation |
|----|---------|-----|----------|-------------|
| A1 | `--text-tertiary` `#6b7a90` under 4.5:1 on canvas/surface | 1.4.3 | Critical | Raise tertiary token |
| A2 | Primary CTA white on `#3b82f6` under 4.5:1 | 1.4.3 | Critical | Darken action / button fill |
| A3 | No skip link to `#main-content` | 2.4.1 | Serious | Add skip link in `base.html` |
| A4 | Incomplete global `:focus-visible`; forms used `outline: none` | 2.4.7 | Serious | Global focus ring + form focus |
| A5 | Sticky chrome can obscure focused content | 2.4.11 | Serious | `scroll-padding-top` |
| A6 | Carousel/lightbox dots under 24×24 CSS px | 2.5.8 | Serious | Expand hit targets |
| A7 | Lightbox lacked Tab focus trap / background inert | 2.1.2 / 2.4.3 | Critical | Trap + inert |
| A8 | Mobile nav: Esc only; no outside-click / focus containment | 2.4.3 | Moderate | Close on outside; keep focus in menu |
| A9 | Form errors not wired with `aria-invalid` / `aria-describedby` | 3.3.1 / 3.3.3 | Serious | Wire in `form.js` |
| A10 | Carousel used incomplete `role="tab"` pattern | 4.1.2 | Moderate | Buttons + `aria-current` |
| A11 | Inactive slides not `aria-hidden` | 4.1.2 | Moderate | Toggle on slide change |
| A12 | Smooth scroll without reduced-motion override | 2.2.2-related | Moderate | Media query |

## N/A for this site

- **3.3.8 Accessible Authentication** — no login
- **3.3.7 Redundant Entry** — single-page forms
- **3.2.6 Consistent Help** — site guide present sitewide (keep)

## Out of scope

- VS Code extension / Engine / ARGUS product WCAG audits
- Formal third-party certification
- Paid accessibility overlay widgets

## Exit criteria

1. `npm run test:a11y` — axe serious + critical = 0 on the URL set in `scripts/test-a11y.mjs` (includes trust, getting-started, sovereign server, and `/ar/` samples for language-of-page)
2. Manual keyboard checklist in [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md) complete
3. [Accessibility statement](../src/accessibility.html) published and linked from the footer

## Remediation status (22 July 2026)

P0–P4 implemented in-repo: contrast tokens, skip link, focus styles, widget targets/traps, form announcements, carousel ARIA cleanup, `npm run test:a11y` CI gate, and public `/accessibility.html`. Automated axe gate is green on the Phase 1 URL set. Manual keyboard/SR checklist remains for human sign-off before claiming production readiness.

**i18n + a11y (22 Jul evening):** Trust, Getting started, and Sovereign server bodies read from `en`/`ar` page packs; docs sidebar uses `locale_path` + `common.docsNav`. Arabic `/ar/…` URLs set `lang=ar` when packs are present (WCAG 3.1.1).