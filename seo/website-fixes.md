# xeenox.in — On‑site fixes that support the GBP ranking

Checked on 15 Oct 2026 using the raw HTML the server sends (this is what Google sees first). The site is a client‑rendered React app built on Hostinger Horizons, so its source is not in this repo. Make these changes in the Hostinger editor.

## Found

| # | Issue | Why it matters | Fix |
|---|---|---|---|
| 1 | **Name mismatch.** The schema and title say `Xeenox`, but the GBP is `Xeenox Technologies` | Google matches the website to the GBP partly by name. A mismatch weakens the link between them | Use "Xeenox Technologies" in the schema `name`, footer, contact page and About page |
| 2 | **Every URL returns the same `<title>` and meta description** (`/`, `/services`, `/about` and `/contact` all show "AI‑Powered Digital Marketing Agency in Bangalore \| Xeenox") | Pages compete with each other and Google may rewrite the titles. Unique titles only appear after JavaScript runs | Enable pre‑rendering/SSR if Hostinger offers it, or set a unique title and description per page (see the table below) |
| 3 | **No `<h1>` in the server HTML** | The H1 only exists after JavaScript renders the page | Make sure each page renders one H1 that includes the main keyword. Check with Search Console → URL Inspection → View crawled page |
| 4 | **The schema is a bare `LocalBusiness`** with no hours, geo, `sameAs`, logo or services | Weak entity signal; no link to the GBP or social profiles | Replace it with `schema-localbusiness.json` |
| 5 | The sitemap lists `/login` at priority 1, and every page has `changefreq: daily` | It wastes crawl and signals nothing | Remove `/login` from the sitemap, add `noindex` to it, and use real `lastmod` dates |
| 6 | Only 5 indexable pages | There is nothing to rank for "SEO company in Bangalore", "Google Ads agency in Bangalore", area searches and so on | Build service and area pages (see below) |
| 7 | A `meta keywords` tag stuffed with "… Bangalore" phrases | Google ignores it, and it looks spammy to anyone reviewing the site | Remove it |
| 8 | Several portfolio items are Palakkad clients | That's fine, since they are real work. Keep them, but **add Bangalore case studies** so the Bangalore relevance comes from real proof | Publish 2–3 Bangalore case studies |

## Technical audit (15 Oct 2026, second pass)

| # | Severity | Finding | Evidence | Fix |
|---|---|---|---|---|
| T1 | 🔴 Critical | **Every page's HTML has `canonical` set to the homepage.** React Helmet adds the correct canonical after JavaScript runs, so the rendered page ends up with two conflicting canonicals | `curl https://xeenox.in/services` returns `<link rel="canonical" href="https://xeenox.in/">` | Remove the hard‑coded canonical from `index.html` and let each route set its own. Then check with Search Console → URL Inspection that `/services` shows "User‑declared canonical: /services" |
| T2 | 🔴 Critical | **Social share images are broken.** `og-home.jpg` and `og-services.jpg` return HTTP 422 | `curl -I https://xeenox.in/og-home.jpg` → 422 | Upload 1200×630 JPGs at those paths, then refresh the previews in the Facebook Sharing Debugger and LinkedIn Post Inspector |
| T3 | 🔴 High | **Unknown URLs return 200 instead of 404** (soft 404s), including `/login` and `/admin` | `curl -o /dev/null -w %{http_code} https://xeenox.in/nonexistent` → 200 | Set up a real 404 route, or at least a `noindex` on the not‑found component. Block `/login` and `/admin` with `noindex` |
| T4 | 🟠 High | **No server‑rendered content.** The HTML has 10 KB of shell and a 930 KB JavaScript bundle, so all text, H1s and links only appear after JavaScript runs | `curl` of any page | Turn on pre‑rendering if Hostinger Horizons supports it. Otherwise keep pages lean and rely on Google's rendering, and check every page in URL Inspection → "View crawled page" |
| T5 | 🟠 Medium | **Bot challenge page.** A headless browser gets "Checking your browser before accessing" | Playwright render of `/` | Make sure Googlebot and Bingbot are let through: run URL Inspection → Test live URL. If Google also sees the challenge page, disable bot protection for verified search bots in Hostinger |
| T6 | 🟡 Medium | `www.xeenox.in` returns 200 instead of redirecting with a 301 to `xeenox.in` | `curl -I https://www.xeenox.in/` | Set up a 301 from www to the apex domain in Hostinger |
| T7 | 🟡 Medium | The favicon is the default `vite.svg`, and `/favicon.ico` returns HTML | `<link rel="icon" href="/vite.svg">` | Upload your own favicon (ICO plus a 512×512 PNG) so the logo shows in Google mobile results |
| T8 | 🟡 Low | `/logo.png` doesn't exist (422), so the schema has no logo to reference | `curl -I https://xeenox.in/logo.png` | Upload a square logo PNG at that path. The schema file already points there |
| T9 | 🟡 Low | Only 2 image alt texts in the bundle ("Xeenox", "Generated") | grep of the JS bundle | Add descriptive alt text to every portfolio and team image, e.g. "Meta Ads lead campaign for Skypool Fitness Studio, Bangalore" |
| T10 | 🟢 OK | HTTPS, the HTTP→HTTPS 301, robots.txt, sitemap and GA4 are all in place | — | — |

Verify a fix the same way the evidence was gathered: run the same curl command or URL Inspection again.

## Page titles and H1s

| URL | Title (≤60 chars) | H1 |
|---|---|---|
| / | Digital Marketing Agency in Bangalore \| Xeenox Technologies | AI‑Powered Digital Marketing Agency in Bangalore |
| /services | Digital Marketing Services in Bangalore \| Xeenox | Digital Marketing Services in Bangalore |
| /services/seo | SEO Company in Bangalore \| Xeenox Technologies | SEO Services in Bangalore That Bring Leads |
| /services/local-seo | Local SEO & Google Business Profile Bangalore \| Xeenox | Rank in the Google Maps Top 3 in Bangalore |
| /services/google-ads | Google Ads Agency in Bangalore \| Xeenox | Google Ads Management in Bangalore |
| /services/meta-ads | Facebook & Instagram Ads Agency Bangalore \| Xeenox | Meta Ads That Generate Leads in Bangalore |
| /services/social-media | Social Media Marketing Agency Bangalore \| Xeenox | Social Media Marketing in Bangalore |
| /services/website-design | Website Design Company in Bangalore \| Xeenox | Website Design & Development in Bangalore |
| /services/ai-chatbot | WhatsApp & AI Chatbot Development Bangalore \| Xeenox | AI Chatbots for Bangalore Businesses |
| /digital-marketing-agency-hsr-layout | Digital Marketing Agency in HSR Layout \| Xeenox | Your Digital Marketing Team in HSR Layout |
| /digital-marketing-agency-koramangala | Digital Marketing Agency in Koramangala \| Xeenox | Digital Marketing for Koramangala Businesses |
| /about | About Xeenox Technologies — Bangalore Digital Agency | About Xeenox Technologies |
| /contact | Contact Xeenox Technologies, HSR Layout Bengaluru | Contact Us |

Meta description pattern: `{Service} in Bangalore by Xeenox Technologies, HSR Layout. {1 proof point}. Call +91 90745 80473 for a free audit.`

## Each service page should have
- 800–1,200 words: the problem, your process, deliverables, pricing from ₹X, a case study, FAQs (with FAQPage schema) and a CTA
- A `Service` schema with `provider` → Xeenox Technologies and `areaServed` → Bengaluru
- Internal links: homepage → service, service → related service, blog → service

## Each area page should have
- Unique content: clients in that area, local landmarks or business mix, directions from HSR, an area FAQ and an embedded map
- A link back to the homepage and to 2–3 services

## Footer (every page)
```
Xeenox Technologies
9th Main Road, Sector 7, HSR Layout, Bengaluru, Karnataka 560102
+91 90745 80473 (tel: link) · xeenox.in@gmail.com
Mon–Sat 9:30 AM – 7:00 PM
[Google Maps] [Instagram] [Facebook] [LinkedIn]
```
Put the NAP in plain HTML text (not an image), make the phone number a tap‑to‑call `tel:` link, and embed a Google Map on the contact page. Use the **GBP's share/embed link** rather than an address query, so the map points at the listing itself.

## Search Console / analytics
- Verify xeenox.in in Google Search Console, submit the sitemap and inspect each new page.
- GA4 is already installed (`G-CBMGD9JJ9L`). Mark form submits, `tel:` clicks and WhatsApp clicks as key events so you can see which keywords bring enquiries.
