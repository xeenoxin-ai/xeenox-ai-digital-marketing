# Getting couples to use Intimacy for Couples

## First, a hard rule about ads

Meta (Facebook and Instagram), Google Ads and YouTube **reject ads for sexual content**, and accounts
that keep trying get banned. Ads are possible only if the ad itself and the page it links to are
romantic and clean:

- **Ad message:** "Games for couples — truth or dare, date ideas, long-distance video dates".
- **Landing page:** `https://intimacycouple.pages.dev/stories/` or `/couple-games-online/`.
  Both are clean. The spicy content stays inside `/play/`, behind the 18+ setup screen.
- **Never use in ads:** "sex", "hot", "positions" or X-Rated screenshots.

Organic growth below is free and is the main plan.

## What is already built into the site

| Growth driver | Where |
| --- | --- |
| 31 search pages (guides, positions, love stories) | Sitemap at `/sitemap.xml` |
| Romantic stories as public pages (proposals, first kisses) | `/stories/` |
| Every couple invites a partner (Love Number / invite link) | Us → Connect |
| "Share with a couple" (WhatsApp / native share) | Home, bottom card |
| Install as an app (PWA) | Home → Install app, on Android Chrome |
| Social share image (Open Graph) | Every page |

## Week 1: get indexed (about 1 hour)

1. **Google Search Console** → add `https://intimacycouple.pages.dev` → verify (send the HTML tag to
   Claude to add) → submit `/sitemap.xml`.
2. **Bing Webmaster Tools** → import from Search Console.
3. Share the 3 best pages on your own WhatsApp status and Instagram story.

## Every week: content that brings couples (2–3 hours)

**Instagram Reels / YouTube Shorts / Moj / Josh** (faceless is fine):
- Screen-record a romantic question and its answer: "Ask your partner: when did you know you loved me?" with the caption "100+ more in the link".
- "POV: your girlfriend sends you a wish at 4 pm 💌": screen-record the wish feature.
- Read a proposal story aloud over a sunset video, with "Full story: link in bio".
- Post 3 a week, at 8–10 pm IST. Hashtags: #couplegoals #longdistancerelationship #couplegames #lovestory #proposal.

**Pinterest** (very strong for "date night ideas" and "questions for couples"):
- Pin each guide page with a vertical image. Pins keep sending traffic for months.

**Reddit** (follow each subreddit's rules, and never spam):
- r/LongDistance, r/relationships, r/IndianRelationships: answer questions honestly, and mention
  the app only where it truly helps.

**Couples creators:** send small Indian couple creators (10k–100k followers) the app and ask for a
"we tried this couples game" video. Many will do it for free if it's fun.

## Every month: more search pages

Ask Claude to add 4 new guide or story pages a month. Good topics:
- romantic questions for couples
- long-distance date ideas
- honeymoon ideas Kerala
- anniversary surprise ideas
- proposal ideas in India
- how to keep the spark alive
- Hindi and Malayalam versions of the top 5 pages

## Measure

Check the **admin page** (`/admin/`) for Love Numbers and couples, and **Cloudflare → Workers →
intimacycouple → Metrics** for visits. Double down on whatever brings the most couples.
