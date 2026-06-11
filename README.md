# ContextMint Marketing Site

Eleventy (11ty) static site for [ContextMint](https://contextmint.ai), deployed to **GitHub Pages**.

The product (backend + VS Code extension) lives in **Azure DevOps** (`repo-awareness`). This repository is **standalone** — marketing and public web only.

## Prerequisites

- Node.js 18+ (20 recommended)
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

## Project structure

```
├── .eleventy.js              # Build config
├── .github/workflows/        # GitHub Pages deploy (runs on push to main)
├── src/
│   ├── _data/site.json       # Global site variables (name, URL, etc.)
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

1. On GitHub: **New repository** → name e.g. `contextmint-ai` or `contextmint-website`
2. Public or private (GitHub Pages works on both for paid/private; public repo is simplest)
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

### 3. Enable GitHub Pages

1. Repo **Settings → Pages**
2. **Build and deployment → Source:** GitHub Actions
3. After the first push, the workflow `.github/workflows/deploy.yml` builds and publishes `_site/`

### 4. Custom domain (optional)

1. **Settings → Pages → Custom domain:** `contextmint.ai`
2. Add the DNS records GitHub shows (usually `A` + `CNAME`)
3. Update `src/_data/site.json` → `"url": "https://contextmint.ai"` (used for OpenGraph tags)

## Ongoing deploy

Every push to `main` triggers a build and deploy. No Azure DevOps pipeline is required for the site.

To deploy manually: **Actions → Deploy to GitHub Pages → Run workflow**.

## Relationship to the product repo

| Repository | Platform | Contents |
|------------|----------|----------|
| `repo-awareness` | Azure DevOps | Backend, ContextLoom VS Code extension, internal docs |
| [`contextmint/contextmint-ai`](https://github.com/contextmint/contextmint-ai) | GitHub | Public marketing site → GitHub Pages |

When product features ship in Azure DevOps, update copy and pages here in a separate commit/PR on GitHub.

## Copying from Azure DevOps

If you develop the site locally inside `repo-awareness/contextmint-ai/` on Azure DevOps, sync to GitHub when ready to publish:

```bash
# From repo-awareness/contextmint-ai/ after changes
git push origin main
```

Keep **one source of truth** on GitHub for the live site. Avoid editing the same pages in both places long term — migrate fully to GitHub (Option A) when the first push is done.
