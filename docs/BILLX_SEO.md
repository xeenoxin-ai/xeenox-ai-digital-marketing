# BillX SEO: what's built in, and what to do next

## Already built into the site (technical + on-page)

| Area | What BillX has |
| --- | --- |
| Crawlable pages | Home page pricing, business types and FAQ are rendered into the HTML at build time, so Google reads them without running JavaScript. Every SEO page is plain HTML with no scripts. |
| Landing pages | **44 business-type pages** at `/billing-software/<type>/` (hospitals, pharmacies, retail, restaurants, garages, salons, schools, builders, transport…), a hub at `/billing-software/`, **`/free-gst-invoice-generator/`** and **`/billing-software-kerala/`**. Each has its own title, description, a single H1, a real sample invoice for that business, its item list with HSN codes and GST rates, pricing, FAQs and links to related types. |
| Structured data | Organization, SoftwareApplication with INR offers, FAQPage on every page, BreadcrumbList, HowTo on the generator page. All covered by automated tests (`tests/billx-seo.test.js`). |
| Meta | Canonical URL on every page (the GitHub Pages copy points to the main site, so there's no duplicate content), Open Graph and Twitter cards with a 1200×630 preview image (`/og.png`), `en-IN` language, theme colour. |
| Sitemap & robots | `/sitemap.xml` (all pages) and `/robots.txt` (blocks `/app/`, `/admin.html`, `/portal.html`, `/api/`). |
| Speed | Static HTML, minified CSS, hashed assets cached for a year (`_headers`), fonts preconnected, Firebase loaded only inside the app. |
| Mobile | Responsive, with no horizontal scroll (checked on a Pixel 7 screen size). |

Change the site address in **`billx/src/site.js` → `url`** when you connect your own domain. Canonicals, sitemap and social cards all follow it.

## Do this in week 1 (free)

1. **Google Search Console** (search.google.com/search-console): add the property for your site URL.
   Choose the "HTML tag" method, put the code into `site.js → googleVerification`, redeploy, verify.
   Then **Sitemaps → submit `sitemap.xml`**. Use *URL inspection → Request indexing* for the home page,
   `/free-gst-invoice-generator/` and your 5 most important business-type pages.
2. **Bing Webmaster Tools**: import from Search Console (one click). Bing also feeds ChatGPT and Copilot search.
3. **Cloudflare Web Analytics** (free, no cookie banner needed): Cloudflare → Analytics → Web Analytics → add site.
4. **Google Business Profile** for *BillX Solutions*, category "Software company", service area Kerala. Add the
   website, WhatsApp number, photos of the app and an opening post. Ask your first 10 customers for reviews.

## Local & listings (weeks 2–4)

List BillX Solutions with the **same name, phone and website everywhere**:
- Indian business directories: JustDial, IndiaMART, Sulekha, TradeIndia
- Software review sites: SoftwareSuggest, Techjockey, Capterra / GetApp, G2
- Product Hunt (launch post), your Xeenox agency website (link "Billing software by BillX")
- Kerala business groups and chambers of commerce, CA / tax-practitioner associations

## Keyword map (each page targets one intent)

| Page | Main searches it targets |
| --- | --- |
| Home | billing software, GST billing software, invoice software India |
| `/free-gst-invoice-generator/` | free GST invoice generator, GST invoice format, online invoice maker |
| `/billing-software-kerala/` | billing software Kerala, billing software Palakkad / Kochi / Thrissur |
| `/billing-software/hospital/` | hospital billing software, hospital bill format |
| `/billing-software/pharmacy-medical-store/` | pharmacy billing software, medical store billing software |
| `/billing-software/retail-shop/`, `/supermarket-grocery-store/` | shop billing software, supermarket billing software |
| `/billing-software/restaurant-cafe/` | restaurant billing software, KOT billing |
| `/billing-software/garage-auto-workshop/` | garage billing software, workshop job card software |
| `/billing-software/school-college-fee-receipt/` | school fee receipt software, fee management |
| …and so on for all 44 types | "billing software for <business type>" |

Check Search Console every month: pages getting impressions but few clicks need a better title or description
(edit `billx/seo/content.mjs`).

## Content plan (2 posts a month)

Write helpful how-to articles and link each one to the matching business-type page. For example:
- GST invoice format: what must be on a tax invoice (with a sample)
- CGST, SGST and IGST: which to charge and when
- How to make a hospital bill with an insurance / TPA share
- HSN and SAC codes for pharmacies, restaurants, garages and salons
- Getting paid faster: UPI QR on invoices
- Bill of supply versus tax invoice

Short **YouTube / Reels** demos ("Make a pharmacy bill in 60 seconds") with the website in the description
also build links and searches for the brand.

## Links that matter

Get mentioned by CAs and tax consultants (offer them a referral commission), local business associations,
your agency's client case studies, and guest posts on Indian small-business blogs. Avoid paid link schemes:
they can get the site penalised.
