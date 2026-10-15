# Hostinger Horizons — paste‑in prompts to fix xeenox.in

xeenox.in is built with **Hostinger Horizons** (the server header says `x-powered-by: Hostinger Horizons`). Horizons edits the site through its AI chat. Open **hPanel → Websites → xeenox.in → Edit in Horizons**, paste **one prompt at a time**, check the preview, then click **Publish**.

Do them in this order. The first three are critical. After each publish, run the check in the **Verify** line.

---

### 1. Fix the canonical tag (critical)
```
In index.html, delete the hard-coded line <link rel="canonical" href="https://xeenox.in/" />. Each route already sets its own canonical through the SEO/Helmet component (md component with canonicalUrl) — make sure every page (/, /services, /portfolio, /about, /contact) passes its own full URL as canonicalUrl, and that there is exactly ONE canonical tag on each rendered page.
```
Verify: `curl -s https://xeenox.in/services | grep canonical` should print nothing (the tag now comes from React). Then use Search Console → URL Inspection → `/services` → the user‑declared canonical should be `/services`.

### 2. Real 404 page and noindex on private pages (critical)
```
Add a catch-all route (path "*") that renders a proper "Page not found" page with a link back to the homepage and the services page, and sets <meta name="robots" content="noindex"> on it. Also add <meta name="robots" content="noindex, nofollow"> to the /login and /admin pages. Remove /login from public/sitemap.xml.
```
Verify: open `https://xeenox.in/abc-test`. It should show your 404 page.

### 3. Social share images, logo and favicon (critical)
Upload your logo first (a square PNG of at least 512×512) and a 1200×630 share image in the Horizons media panel. Then paste:
```
Use the uploaded logo as the site favicon (replace /vite.svg) and also serve it at /logo.png. Use the uploaded 1200×630 image as the Open Graph and Twitter image for every page — make sure the og:image URL on each page actually loads (currently /og-home.jpg and /og-services.jpg return errors). Add og:site_name "Xeenox Technologies" and twitter:card "summary_large_image".
```
Verify: `curl -I https://xeenox.in/logo.png` returns 200. Paste the URL into the Facebook Sharing Debugger and the LinkedIn Post Inspector to check the preview image.

### 4. Business name and schema
```
Replace the JSON-LD LocalBusiness script in index.html with the following JSON-LD exactly (keep it inside <script type="application/ld+json">). Also change the brand name shown in the footer, contact page and about page to "Xeenox Technologies".
```
Paste the contents of `seo/schema-localbusiness.json` after the prompt. First replace the `REPLACE_` values: get the latitude and longitude from your GBP pin (right‑click it in Google Maps), the map link from GBP → Share, and your LinkedIn URL. If you don't have one of these yet, delete that line instead.

Verify: run https://search.google.com/test/rich-results on xeenox.in. It should report "LocalBusiness detected" with no errors.

### 5. One H1 and unique titles per page
```
Make sure each page renders exactly one <h1>:
- Home: "AI-Powered Digital Marketing Agency in Bangalore"
- Services: "Digital Marketing Services in Bangalore"
- Portfolio: "Digital Marketing Case Studies — Bangalore & Kerala"
- About: "About Xeenox Technologies"
- Contact: "Contact Xeenox Technologies, HSR Layout"
Remove the meta keywords tag from all pages. Keep the existing unique titles and descriptions per page.
```

### 6. Footer NAP and contact page
```
Update the footer on every page to show, as plain text (not an image):
Xeenox Technologies
9th Main Road, Sector 7, HSR Layout, Bengaluru, Karnataka 560102
+91 90745 80473 (as a tel:+919074580473 link) · xeenox.in@gmail.com
Mon–Sat 9:30 AM – 7:00 PM
plus icon links to Instagram (https://www.instagram.com/thexeenox/), Facebook, LinkedIn and our Google Business Profile.
On the contact page, replace the address-search Google Map embed with the embed code from our Google Business Profile (I'll paste it below).
```
Get the embed code from Google Maps → open your listing → Share → Embed a map, and paste it after the prompt.

### 7. Image alt text
```
Add descriptive alt text to every image on the site. Portfolio images: "<service> for <client>, <city>" e.g. "Meta Ads lead generation for Skypool Fitness Studio, Bangalore". Team photos: "<name>, <role> at Xeenox Technologies". Decorative images: alt="".
```

### 8. New service pages (one prompt per page)
For each file in `seo/pages/services/`:
```
Create a new page at /services/<slug> using the same design as the existing Services page. Use this content exactly — the title tag, meta description and H1 are at the top; add the JSON-LD block at the bottom inside <script type="application/ld+json"> in the page head. Link to it from the Services page grid and the footer. Add it to public/sitemap.xml.
```
Paste the page's markdown after the prompt. **First fill in or delete every `₹X`, `[verify …]`, `[add …]` and `<!-- verify claim -->` marker.** Do the same for `seo/pages/areas/*` (route `/digital-marketing-agency-hsr-layout` etc.) and later the blog posts (`/blog/<slug>`).

### 9. Sitemap and www
```
Regenerate public/sitemap.xml to include every public page and blog post with the real last-modified date, no changefreq "daily" unless the page really changes daily, and without /login or /admin.
```
For the **www → apex redirect**, go to hPanel → Domains → xeenox.in → Redirects and add a 301 from `www.xeenox.in` to `https://xeenox.in`. If Horizons manages the domain, ask Hostinger support for this.

### 10. Bot protection
In hPanel → Security, check that the "Checking your browser…" challenge does not block search engines. In Search Console, run **URL Inspection → Test live URL** on the homepage. The screenshot must show your real page, not the challenge.

---

## After publishing
1. Search Console → Sitemaps → resubmit `https://xeenox.in/sitemap.xml`.
2. URL Inspection → **Request indexing** for the home page, each service page and the area pages.
3. Tell Claude "published" in this session and it will re‑run the curl audit to confirm each fix is live.
