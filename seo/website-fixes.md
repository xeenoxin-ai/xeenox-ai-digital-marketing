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
