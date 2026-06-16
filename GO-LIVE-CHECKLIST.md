# ContextMint website — go-live checklist

Use this when replacing the placeholder at [contextmint.ai](https://contextmint.ai).

## Before deploy

1. Edit `src/_data/site.json`:
   - `founderName` — your full name
   - `founderTitle` — e.g. `Founder & CEO` or `Founder, CEO & CTO`
   - `contactEmail` — working inbox (hello@contextmint.ai must receive mail)
   - `formspreeFormId` — optional; get from [formspree.io](https://formspree.io) (free tier). Leave empty to use mailto fallback.

2. Local verify:
   ```bash
   cd contextmint-ai
   npm install
   npm run build
   npm run dev
   ```
   Check: `/`, `/design-partners.html`, `/request-demo.html`, form submit.

3. Push to GitHub `contextmint/contextmint-ai` on `main`.

## DNS + GitHub Pages

1. GitHub repo → **Settings → Pages → Source:** GitHub Actions
2. DNS at your registrar for `contextmint.ai`:
   - `A` records → GitHub Pages IPs (see GitHub docs)
   - `CNAME` `www` → `contextmint.github.io` (or your org pages host)
3. GitHub repo → **Settings → Pages → Custom domain:** `contextmint.ai`
4. **Actions → Deploy to GitHub Pages → Run workflow**
5. Wait for TLS certificate (can take up to 24h)

## After live

- [ ] Test form on production URL
- [ ] Add URL to Hub71 application
- [ ] Add URL to LinkedIn profile (Featured link)
- [ ] Google Search Console — submit sitemap (optional)
