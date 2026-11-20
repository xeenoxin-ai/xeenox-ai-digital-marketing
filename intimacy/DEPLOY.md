# Launching Intimacy for Couples

**Live now:** https://intimacycouple.pages.dev (free address, free hosting)

How the free address works: the Cloudflare Pages project `intimacycouple` holds a 7-line `pages/_worker.js`
that forwards every request to the `intimacycouple` Worker through a service binding called `BACKEND`.
The Worker serves the whole site and backend. Visits to the raw `…workers.dev` address are redirected
to the Pages address. The Pages proxy almost never changes. If it does, redeploy it with:

```bash
curl -X POST -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/775c1e02700fc336b170f305a68dd33e/pages/projects/intimacycouple/deployments" \
  -F 'manifest={}' -F 'branch=main' -F '_worker.js=@intimacy/pages/_worker.js;type=application/javascript+module'
```

| Part | Where it runs | Cost |
| --- | --- | --- |
| Website: landing page, 9 SEO guides, `/play` game, sitemap | Cloudflare Worker `intimacycouple` | ₹0 (free plan: 100,000 requests/day) |
| Backend: Love Numbers, pairing, live rooms | Same Worker, plus Durable Objects (rooms) and D1 database `intimacycouple` (APAC) | ₹0 to start |
| Voice and video | Directly phone-to-phone (WebRTC). Optional Cloudflare TURN relay (step 3) | ₹0. TURN is free up to 1,000 GB/month, then about $0.05/GB |
| Address `intimacycouple.pages.dev` | Cloudflare Pages | ₹0, free forever |
| Own domain later, e.g. `intimacycouple.com` (optional) | Cloudflare Registrar | About $10–11 a year |

## 1. Optional, later: buy your own domain (10 minutes)

The site works fully on the free `pages.dev` address. A `.com` costs money everywhere. There's no trustworthy free `.com`,
and free-domain services (`eu.org`, `dpdns.org` and similar) are slow to approve, can be taken away,
and rank poorly. Buy one only when you're ready.


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

Change `SITE_URL` under `[vars]` in `wrangler.toml` to `https://intimacycouple.com`. Then build with the new address and deploy:

```bash
SITE_URL=https://intimacycouple.com npm run deploy:intimacy
```

In GitHub → Settings → Secrets and variables → Actions → **Variables**, add `SITE_URL` =
`https://intimacycouple.com` so automatic deploys use it too.

Also add the domain to the Pages project (Pages → intimacycouple → Custom domains) or remove the Pages project, so there's only one public address.

**One address for SEO:** in Cloudflare → intimacycouple.com → **Rules → Redirect Rules**, create
"Redirect from WWW to root" (it's a ready-made template). This sends `www.` to the bare domain with a 301 redirect.

## 3. Reliable calls on every network (optional, free)

Some mobile networks block direct phone-to-phone connections, so calls there need a TURN relay.
Games and chat work everywhere without one; only voice and video need it.

**Free option, no card needed:** sign up at a TURN provider with a free plan, for example
**ExpressTURN** (expressturn.com) or **Metered Open Relay** (metered.ca). Check each one's current
free limit when you sign up. The dashboard shows a TURN URL, a username and a password.
Add them to the Worker as secrets in Cloudflare → Workers & Pages → `intimacycouple` → Settings →
**Variables and Secrets** → Add, using type **Secret**:

| Name | Value (example) |
| --- | --- |
| `TURN_URL` | `turn:relay1.expressturn.com:3478` (several allowed, comma-separated) |
| `TURN_USERNAME` | the username from the provider |
| `TURN_CREDENTIAL` | the password from the provider |

They take effect immediately. Never paste these into chats or commit them to GitHub.

**Paid-card option:** Cloudflare Realtime TURN (1,000 GB/month free, but it requires a card on file).
Set `TURN_KEY_ID` and `TURN_KEY_API_TOKEN` instead.

## 3b. Community review (required for stories to appear)

Every community story waits for your approval before anyone can see it, and stories reported 3 times come back for review.

1. Make up a long admin key of at least 16 characters, e.g. a sentence with numbers. Keep it private.
2. In Cloudflare → Workers & Pages → `intimacycouple` (Worker) → Settings → Variables and Secrets → Add
   **Secret** `ADMIN_KEY` = your key.
3. Open **https://intimacycouple.pages.dev/admin/**, enter the key, then approve or reject stories. The page also shows how
   many Love Numbers, couples and live stories you have.

The server automatically blocks posts with phone numbers, links, social handles and "offers", and anything
mentioning minors. You are still responsible for what you approve, so check every post.

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
