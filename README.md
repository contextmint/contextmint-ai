# ContextMint Marketing Site

Eleventy (11ty) static site for [contextmint.ai](https://contextmint.ai).

**Repository:** [github.com/contextmint/contextmint-ai](https://github.com/contextmint/contextmint-ai)  
**Stack:** Eleventy → static `_site/` → GitHub Pages (manual deploy workflow)

The live domain may still show a placeholder until you complete [documentation/WEBSITE-GO-LIVE.md](./documentation/WEBSITE-GO-LIVE.md).

## Prerequisites

- Node.js **18+** (24 recommended; matches GitHub Actions)
- npm
- Git

## Run and build locally

From the repository root:

```bash
# 1. Install dependencies (first time, or after package.json changes)
npm install

# 2. Development server — live reload at http://localhost:8080
npm run dev

# 3. Production build — output in _site/
npm run build

# 4. Optional: regenerate settings catalogs (if package sources are present)
npm run gen:settings

# 5. Optional: clean build output
npm run clean
```

**Verify after `npm run dev`:** open [http://localhost:8080](http://localhost:8080) and check `/`, `/faq.html`, `/getting-started.html`, `/design-partners.html`.

**Verify after `npm run build`:** confirm `_site/index.html` exists and assets are under `_site/assets/`.

### Settings reference pages

The [Settings reference](/docs/settings.html) page uses generated data in `src/_data/extensionSettings.json` and `src/_data/serverChatSettings.json`. Run `npm run gen:settings` when upstream package sources are available; otherwise commit and build using the JSON files already in the repo.

## Project structure

```
├── .eleventy.js              # Build config
├── .github/workflows/        # GitHub Pages deploy (manual workflow)
├── documentation/
│   ├── README.md             # Index of site docs
│   ├── WEBSITE-GO-LIVE.md    # Go-live guide
│   ├── GO-LIVE-CHECKLIST.md  # Deploy checklist
│   └── SITE-GUIDE-CHAT-PLAN.md
├── src/
│   ├── _data/site.json       # Global site variables (name, URL, etc.)
│   ├── _data/extensionSettings.json
│   ├── _data/serverChatSettings.json
│   ├── scripts/              # Build-time generators
│   ├── _includes/            # nav.html, footer.html
│   ├── _layouts/base.html
│   ├── index.html
│   └── assets/               # css, js, img
└── package.json
```

## Documentation

| Document | Description |
|----------|-------------|
| [documentation/README.md](./documentation/README.md) | Index of all site docs |
| [documentation/WEBSITE-GO-LIVE.md](./documentation/WEBSITE-GO-LIVE.md) | Go-live guide (DNS, GitHub Pages, messaging) |
| [documentation/GO-LIVE-CHECKLIST.md](./documentation/GO-LIVE-CHECKLIST.md) | Short deploy checklist |
| [documentation/SITE-GUIDE-CHAT-PLAN.md](./documentation/SITE-GUIDE-CHAT-PLAN.md) | Site guide widget (planned) |

## Adding a page

Create `src/about.html`:

```html
---
layout: base.html
title: About | ContextMint
description: Mission and vision for ContextMint.
---

<section class="section">
  <div class="container">
    <h1>About</h1>
  </div>
</section>
```

Nav and footer are included automatically via `base.html`.

## Deploy

Pushes to `main` do **not** publish the site automatically. When GitHub Pages is enabled:

1. **Actions → Deploy to GitHub Pages → Run workflow** (manual)
2. Follow [documentation/WEBSITE-GO-LIVE.md](./documentation/WEBSITE-GO-LIVE.md) for DNS, TLS, and `src/_data/site.json` updates
