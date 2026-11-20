# Launching Intimacy for Couples

**Live now:** https://intimacycouple.xeenox-in.workers.dev (free Cloudflare address)

| Part | Where it runs | Cost |
| --- | --- | --- |
| Website: landing page, 9 SEO guides, `/play` game, sitemap | Cloudflare Worker `intimacycouple` | ₹0 (free plan: 100,000 requests/day) |
| Backend: Love Numbers, pairing, live rooms | Same Worker, plus Durable Objects (rooms) and D1 database `intimacycouple` (APAC) | ₹0 to start |
| Voice and video | Directly phone-to-phone (WebRTC). Optional Cloudflare TURN relay (step 3) | ₹0. TURN is free up to 1,000 GB/month, then about $0.05/GB |
| Domain `intimacycouple.com` | Cloudflare Registrar (or any registrar) | About $10–11 a year (check the price shown when you buy) |

## 1. Buy the domain (10 minutes)

1. Cloudflare dashboard → **Domain Registration → Register Domains** → search `intimacycouple`.
   `.com` is the best choice for SEO and trust. Cloudflare Registrar does not sell `.in`; buy `.in`
   from another registrar and then add it to Cloudflare as a site (free plan) if you want both.
2. Buy it. The domain appears under **Websites** automatically.

## 2. Point the domain at the app (5 minutes)

Add this to `intimacy/wrangler.toml`:

```toml
routes = [
  { pattern = "intimacycouple.com", custom_domain = true },
  { pattern = "www.intimacycouple.com", custom_domain = true },
]
```

Then build with the new address and deploy:

```bash
SITE_URL=https://intimacycouple.com npm run deploy:intimacy
```

In GitHub → Settings → Secrets and variables → Actions → **Variables**, add `SITE_URL` =
`https://intimacycouple.com` so automatic deploys use it too.

**One address for SEO:** in Cloudflare → intimacycouple.com → **Rules → Redirect Rules**, create
"Redirect from WWW to root" (it's a ready-made template). This sends `www.` to the bare domain with a 301 redirect.

## 3. Reliable calls on every network (optional, recommended)

Some mobile networks block direct phone-to-phone connections. A TURN relay fixes that:

1. Cloudflare dashboard → **Realtime → TURN Server → Create**. Copy the **Key ID** and **API token**.
2. Save them as Worker secrets:
   ```bash
   cd intimacy
   npx wrangler@4.156.0 secret put TURN_KEY_ID
   npx wrangler@4.156.0 secret put TURN_KEY_API_TOKEN
   ```
The app picks them up automatically through `/api/ice`.

## 4. Automatic deploys from GitHub

`.github/workflows/intimacy-cloudflare.yml` runs the tests, builds the site and deploys on every
push to `main` that changes `intimacy/`. It uses the same `CLOUDFLARE_API_TOKEN` secret as BillX.
That token needs these permissions: **Workers Scripts: Edit**, **D1: Edit**, and, after step 2,
**Workers Routes: Edit** on the zone. If the BillX token only has Pages access, edit it in
Cloudflare → My Profile → API Tokens.

## 5. SEO launch checklist

Already built in:
- A unique title, description and canonical URL on every page, plus Open Graph and Twitter
  cards with a 1200×630 share image.
- JSON-LD structured data: `WebSite`, `Organization`, `WebApplication` (free, 18+),
  `BreadcrumbList` and `FAQPage`.
- `sitemap.xml` and `robots.txt` (`/api/` is blocked from crawlers), plus a real 404 page.
- 9 keyword-targeted guides, each generated from the game's own card decks, so they stay in sync:
  truth or dare for couples, sex positions, sex tips, couple games online, long distance
  relationship games, never have I ever, would you rather, date night ideas and questions
  for couples. All pages link to each other and to `/play/`.
- `<meta name="rating" content="adult">` on explicit pages. This is honest labelling: Google's
  SafeSearch filters these pages, but they can still rank for normal searches.
- Fast pages: plain HTML with no framework, about 10 KB each.

After the domain is live:
1. **Google Search Console** → add the domain property (verify with DNS in Cloudflare) →
   submit `https://intimacycouple.com/sitemap.xml`.
2. **Bing Webmaster Tools** → import from Search Console. This also covers DuckDuckGo and Yahoo.
3. Share the guides on Pinterest, Reddit (r/LongDistance, r/relationships, where rules allow),
   Instagram Reels and YouTube Shorts. Links back to the site build authority.
4. Add one new guide per week in `intimacy/site/build.mjs` (`GUIDES.push(...)`), for example
   "couple games for date night", "spicy questions to ask your partner", "how to talk dirty to your partner"
   or "honeymoon games". Then redeploy.
5. Hindi and Malayalam versions of the top guides (with `hreflang`) are the biggest next win for India.

## 6. Scaling to many couples

- Each couple's room is its own Durable Object, so there's no shared bottleneck.
  Rooms hibernate when idle, so a quiet couple costs almost nothing.
- D1 is only used to create a Love Number and to pair. Normal play never touches the database.
- The free Workers plan allows 100,000 requests a day. For heavy traffic, the Workers Paid plan
  ($5/month) includes 10 million requests and Durable Object usage.
- The server stores no intimate data, so there is very little to leak.

## Local development

```bash
npm run dev:intimacy          # website + backend at http://localhost:8787
node --test tests/intimacy.test.js
```
