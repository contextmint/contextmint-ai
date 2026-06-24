# ContextMint Marketing Site

Eleventy (11ty) static site for ContextMint.

**This repo is private source control only.** The live domain [contextmint.ai](https://contextmint.ai) currently serves a separate placeholder — do **not** enable GitHub Pages until you are ready to replace it.

The product (backend + VS Code extension) lives in **Azure DevOps** (`repo-awareness`).

## Prerequisites

- Node.js 18+ (24 recommended for CI; matches GitHub Actions)
- npm
- A GitHub account (for hosting and deploy)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080). The dev server reloads on file changes.

## Production build

```bash
npm run build
```

Output is written to `_site/`.

### Extension settings reference

The [Settings reference](/docs/settings.html) page is generated from `extensions/contextmint-vscode/package.json` when that path exists in the monorepo:

```bash
npm run gen:settings   # writes src/_data/extensionSettings.json
```

In the standalone GitHub `contextmint-ai` repo, commit `src/_data/extensionSettings.json` and `src/_data/serverChatSettings.json`, then run `npm run build` — each generator reuses the committed file when the monorepo source paths are absent.

## Project structure

```
├── .eleventy.js              # Build config
├── .github/workflows/        # GitHub Pages deploy (runs on push to main)
├── src/
│   ├── _data/site.json       # Global site variables (name, URL, etc.)
│   ├── _data/extensionSettings.json  # Generated VS Code settings catalog
│   ├── _data/serverChatSettings.json # Generated server evidence-assembly catalog
│   ├── scripts/gen-extension-settings-doc.mjs
│   ├── _includes/            # nav.html, footer.html — edit once, all pages update
│   ├── _layouts/base.html    # Page shell (<head>, nav, footer)
│   ├── index.html            # Homepage
│   └── assets/               # css, js, img
└── package.json
```

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

## First-time setup on GitHub

Use this when creating the **standalone** repo (contents of this folder become the repo root).

### 1. Create the GitHub repository

1. On GitHub: **New repository** → name `contextmint-ai`
2. **Private** — code storage only; no public site from this repo yet
3. Do **not** add a README, `.gitignore`, or license — this folder already has them

### 2. Push this folder as the repo root

From your machine, inside **this** directory (`contextmint-ai/`):

```bash
git init
git add .
git commit -m "Initial ContextMint marketing site (Eleventy + GitHub Pages)"
git branch -M main
git remote add origin https://github.com/contextmint/contextmint-ai.git
git push -u origin main
```

Organization: [github.com/contextmint](https://github.com/contextmint)

### 3. Do not enable GitHub Pages yet

Leave **Settings → Pages** disabled. Your placeholder at `contextmint.ai` stays live until you deliberately switch.

### 4. When ready to go live (later)

1. **Settings → Pages → Source:** GitHub Actions
2. Point DNS for `contextmint.ai` at GitHub (replacing the placeholder host)
3. **Actions → Deploy to GitHub Pages → Run workflow** (manual only)
4. Update `src/_data/site.json` → `"url": "https://contextmint.ai"`

## Deploy

Pushes to `main` do **not** publish the site. Deploy is manual via **Actions → Deploy to GitHub Pages → Run workflow** after Pages is enabled.

## Relationship to the product repo

| Repository | Platform | Contents |
|------------|----------|----------|
| `repo-awareness` | Azure DevOps | Backend, ContextMint VS Code extension, internal docs |
| [`contextmint/contextmint-ai`](https://github.com/contextmint/contextmint-ai) | GitHub | Public marketing site → GitHub Pages |

When product features ship in Azure DevOps, update copy and pages here in a separate commit/PR on GitHub.

## Copying from Azure DevOps

If you develop the site locally inside `repo-awareness/contextmint-ai/` on Azure DevOps, sync to GitHub when ready to publish:

```bash
# From repo-awareness/contextmint-ai/ after changes
git push origin main
```

Keep **one source of truth** on GitHub for the live site. Avoid editing the same pages in both places long term — migrate fully to GitHub (Option A) when the first push is done.
