# Website Go-Live — contextmint.ai

Marketing site source: **this repository** (Eleventy → GitHub Pages).  
Product code (backend + VS Code extension) is maintained separately — not required to edit or deploy this site.

**Related:** [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md) · [SITE-GUIDE-CHAT-PLAN.md](./SITE-GUIDE-CHAT-PLAN.md) (planned widget)

---

## Content alignment (already on site)

| Change | File |
|--------|------|
| Tagline: “Evidence-based AI decisions with human oversight” | `src/_data/site.json` |
| Founder name/title placeholders | `src/_data/site.json` |
| Formspree + mailto fallback | `src/assets/js/form.js`, `request-demo.html` |
| “Shipping now” v1.0 section | `src/index.html` |
| Design Partners page | `src/design-partners.html` |
| Nav + footer links | `src/_includes/nav.html`, `footer.html` |
| Honest Early Access tiers | `src/pricing.html` |
| Founder mention | `src/about.html` |
| Operational intelligence roadmap section | `src/roadmap.html#operational-intelligence` |
| Glossary: reconciliation + OIR terms | `src/docs/glossary.html#operational-intelligence` |

**Planned (not shipped):** Site guide chat widget — [SITE-GUIDE-CHAT-PLAN.md](./SITE-GUIDE-CHAT-PLAN.md). Tier 3 (OpenAI) deferred.

---

## Before deploy — edit `src/_data/site.json`

```json
{
  "founderName": "Your Actual Name",
  "founderTitle": "Founder & CEO",
  "contactEmail": "hello@contextmint.ai",
  "formspreeFormId": "your_formspree_id"
}
```

1. **Formspree:** [formspree.io](https://formspree.io) → create form → copy ID from `https://formspree.io/f/XXXXXXXX`  
2. Leave `formspreeFormId` empty to use **mailto fallback** until Formspree is set up.  
3. Ensure `hello@contextmint.ai` receives mail.

---

## Local verify

```bash
npm install
npm run build
npm run dev
```

Open http://localhost:8080 — check:

- `/` — Shipping now section  
- `/roadmap.html#operational-intelligence` — operational intelligence (planned)  
- `/design-partners.html` — form  
- `/request-demo.html` — form submit  
- `/about.html` — founder block  

---

## Push to GitHub

Repo: [github.com/contextmint/contextmint-ai](https://github.com/contextmint/contextmint-ai)

```bash
git add .
git commit -m "Site update: messaging, forms, content"
git push origin main
```

---

## DNS + GitHub Pages

1. GitHub repo → **Settings → Pages → Source:** GitHub Actions  
2. DNS at registrar for `contextmint.ai`:
   - `A` records → GitHub Pages IPs ([GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site))
   - `CNAME` `www` → your GitHub Pages host  
3. **Settings → Pages → Custom domain:** `contextmint.ai`  
4. **Actions → Deploy to GitHub Pages → Run workflow** (manual)  
5. Wait for TLS (up to 24h)  

Also see: [GO-LIVE-CHECKLIST.md](./GO-LIVE-CHECKLIST.md)

---

## After live

- [ ] Test form on production URL  
- [ ] Add URL to partner / accelerator applications as needed  
- [ ] Add URL to LinkedIn Featured  
- [ ] Optional: Google Search Console sitemap  

---

## Messaging: website vs product reality

Keep public copy honest. **Shipped (v1.0)** vs **roadmap** must stay distinct on product vision pages.

| Say on site (v1.0) | Roadmap (OK on roadmap / product vision pages) |
|--------------------|-----------------------------------------------|
| ContextMint Engine | PR Verification Engine |
| Context Lens | Blast radius on every PR |
| Quality map | Full Engineering Reality Graph |
| Symbol-aware citations | Knowledge reconciliation |
| Human gates before inference + apply | Operational intelligence retrieval / OIR |
| Local-first / sovereign deployment | Enterprise SSO / SOC 2 |

Homepage includes **Shipping now** + **Roadmap** link to avoid overclaiming.

**Do not claim on site:** published seat pricing (use waitlist / design partner); `npm install` as install path; “SOC 2 certified today”; generic ChatGPT replacement. Install story = Engine + VS Code extension + Ollama — see `src/faq.html`, `src/getting-started.html`.
