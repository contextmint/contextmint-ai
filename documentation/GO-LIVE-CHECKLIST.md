# ContextMint website — go-live checklist

Use this when replacing the placeholder at [contextmint.ai](https://contextmint.ai).

**Full guide:** [WEBSITE-GO-LIVE.md](./WEBSITE-GO-LIVE.md)

## Before deploy

1. Edit `src/_data/site.json`:
   - `founderName` — your full name
   - `founderTitle` — e.g. `Founder & CEO` or `Founder, CEO & CTO`
   - `contactEmail`, `legalEmail`, `privacyEmail` — inboxes (kept in config even when hidden)
   - `emailVisible` — set `true` when mail is live; while `false`, no mailto links or mailto form fallback are shown
   - `formspreeFormId` — optional; get from [formspree.io](https://formspree.io) (free tier). Required for demo/design-partner forms while `emailVisible` is false.

2. Local verify:
   ```bash
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
- [ ] Add URL to partner applications as needed
- [ ] Add URL to LinkedIn profile (Featured link)
- [ ] Google Search Console — submit sitemap (optional)
