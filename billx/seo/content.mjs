// SEO content for BillX: pre-rendered HTML for the home page and a set of
// landing pages (one per business type, a free GST invoice generator page,
// a Kerala page, a hub), plus sitemap and robots. Pure functions; the Vite
// plugin in ./plugin.mjs writes them into the build.
import { SITE } from '../src/site.js';
import { PLANS, TRIAL_DAYS, GST_RATE, plansIn } from '../src/plans.js';
import { INDUSTRIES, groupedIndustries, starterItems, sampleValue } from '../src/industries.js';
import { renderInvoice } from '../src/templates.js';
import { DEFAULT_SHOW } from '../src/store.js';
import { formatMoney } from '../src/calc.js';

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupees = (n) => formatMoney(n, 'INR').replace(/\.00$/, '');
const minPrice = Math.min(...Object.values(PLANS).map((p) => p.monthly));

// Accounts (Firebase) switched on? Without them BillX is the free on-device
// version, so pages must not promise a trial, cloud backup or staff logins.
let CLOUD = true;
export const setCloudMode = (v) => { CLOUD = !!v; };
const startCTA = () => (CLOUD ? `Start ${TRIAL_DAYS}-day free trial` : 'Start free');
const startShort = () => (CLOUD ? 'Start free trial' : 'Start free');
const trialNote = () => (CLOUD ? `${TRIAL_DAYS}-day free trial` : 'Free to start');

/** URL slug and the audience phrase used in titles, per business type. */
export const SECTORS = {
  retail: ['retail-shop', 'retail shops'], grocery: ['supermarket-grocery-store', 'supermarkets & grocery stores'],
  electronics: ['electronics-mobile-shop', 'electronics & mobile shops'], textile: ['textile-garment-shop', 'textile & garment shops'],
  jewellery: ['jewellery-shop', 'jewellery shops'], hardware: ['hardware-building-materials', 'hardware & building material shops'],
  furniture: ['furniture-shop', 'furniture shops'], wholesale: ['wholesale-distributor', 'wholesalers & distributors'],
  restaurant: ['restaurant-cafe', 'restaurants & cafes'], bakery: ['bakery-sweet-shop', 'bakeries & sweet shops'],
  catering: ['catering', 'caterers'], hotel: ['hotel-homestay-resort', 'hotels, homestays & resorts'],
  hospital: ['hospital', 'hospitals'], clinic: ['clinic-doctor-dental', 'clinics, doctors & dentists'],
  pharmacy: ['pharmacy-medical-store', 'pharmacies & medical stores'], diagnostics: ['diagnostic-lab-scan-centre', 'diagnostic labs & scan centres'],
  optical: ['optical-shop', 'optical shops'], veterinary: ['veterinary-pet-clinic', 'veterinary & pet clinics'],
  services: ['marketing-agency', 'marketing & creative agencies'], it: ['it-software-company', 'IT & software companies'],
  professional: ['ca-lawyer-consultant', 'CAs, lawyers & consultants'], freelancer: ['freelancer', 'freelancers'],
  security: ['security-housekeeping-manpower', 'security, housekeeping & manpower agencies'],
  automobile: ['garage-auto-workshop', 'garages & auto workshops'], repair: ['mobile-laptop-appliance-repair', 'mobile, laptop & appliance repair shops'],
  electrical: ['electrician-plumber-contractor', 'electricians, plumbers & contractors'], salon: ['salon-spa-beauty-parlour', 'salons, spas & beauty parlours'],
  gym: ['gym-yoga-fitness', 'gyms, yoga & fitness centres'], education: ['school-college-fee-receipt', 'schools & colleges'],
  coaching: ['coaching-training-institute', 'coaching & training institutes'], construction: ['builder-construction', 'builders & construction contractors'],
  interior: ['interior-designer', 'interior designers'], realestate: ['rent-invoice-real-estate', 'landlords & real estate'],
  transport: ['transport-logistics-courier', 'transport, logistics & courier companies'], taxi: ['taxi-cab-vehicle-rental', 'taxi, cab & vehicle rental'],
  travel: ['travel-agency-tours', 'travel agencies & tour operators'], manufacturing: ['manufacturing-factory', 'manufacturers & factories'],
  printing: ['printing-press-signage', 'printing presses & signage'], agriculture: ['agriculture-farm-produce', 'farms, agri inputs & produce traders'],
  events: ['event-management-decor', 'event managers & decorators'], photography: ['photography-studio', 'photography studios'],
  ngo: ['ngo-trust-donation-receipt', 'NGOs, trusts, temples & churches'], association: ['club-association-society', 'clubs, associations & housing societies'],
  general: ['small-business', 'small businesses'],
};
export const sectorPath = (key) => `billing-software/${SECTORS[key][0]}/`;

export const homeFaq = () => [
  ['Is BillX free to try?', CLOUD ? `Yes. Every plan starts with a ${TRIAL_DAYS}-day free trial with all features, and no card is needed. You can also use the free invoice generator without creating an account.` : 'Yes. Start free on any phone or computer, no sign-up needed: make GST invoices, quotes and receipts, print or download them as PDF.'],
  ['Do I need to install anything?', 'No. BillX runs in Chrome or Safari on any phone or computer. On a phone you can add it to the home screen like an app.'],
  ['Is BillX GST compliant?', 'Yes. It shows GSTIN, HSN/SAC codes, place of supply, CGST + SGST or IGST (picked automatically from the state), a GST summary and the amount in words, and gives you GST reports by rate for GSTR-1 and GSTR-3B.'],
  ['How do I pay for BillX?', `Pay ${SITE.company} by UPI, GPay, PhonePe, Paytm or bank transfer, then send the payment reference. Your plan is switched on after we confirm the payment. Prices start at ${rupees(minPrice)} a month.`],
  ...(CLOUD ? [['What happens after the free trial?', 'Choose a plan to keep creating bills. If you don\'t, your account becomes read-only: nothing is deleted, and you can still view and download your bills.']] : []),
  ['Is my data safe?', CLOUD ? 'Your data is stored in Google Cloud (Firebase), encrypted in transit and at rest, and only people you add can see it. You can download a full backup any time.' : 'Your bills are saved on your own device and never uploaded. Download a full backup from Settings any time and restore it on another device.'],
  ['Can you set it up for us?', 'On the Pro plan we set up your logo, designs and item list, move data from your old software and train your staff.'],
  ['Does it work for hospitals and clinics?', 'Yes. It has patient fields (UHID, IP/OP no., consultant, ward, admission and discharge dates), services grouped by department, and an insurance / TPA share with the balance the patient pays.'],
];

const faqJsonLd = (faq) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
const orgJsonLd = () => ({
  '@context': 'https://schema.org', '@type': 'Organization', name: SITE.company, url: SITE.url, logo: `${SITE.url}/logo.svg`,
  address: { '@type': 'PostalAddress', addressLocality: 'Palakkad', addressRegion: 'Kerala', addressCountry: 'IN' },
  ...(SITE.whatsapp ? { contactPoint: { '@type': 'ContactPoint', telephone: `+${SITE.whatsapp}`, contactType: 'customer support', areaServed: 'IN' } } : {}),
});
const appJsonLd = (name = 'BillX', description = '') => ({
  '@context': 'https://schema.org', '@type': 'SoftwareApplication', name, applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Billing and invoicing software', operatingSystem: 'Web, Android, iOS, Windows, macOS',
  url: SITE.url, description,
  offers: {
    '@type': 'AggregateOffer', priceCurrency: 'INR', lowPrice: minPrice, highPrice: Math.max(...Object.values(PLANS).map((p) => p.monthly)),
    offerCount: Object.keys(PLANS).length,
    offers: Object.values(PLANS).map((p) => ({ '@type': 'Offer', name: `${p.name} (monthly)`, price: p.monthly, priceCurrency: 'INR' })),
  },
  publisher: { '@type': 'Organization', name: SITE.company },
});
const crumbsJsonLd = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE.url}/${path}` })),
});
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

/** <head> tags: canonical, social cards, verification, structured data. */
export function headTags({ title, description, path = '', jsonLd = [], noindex = false }) {
  const url = `${SITE.url}/${path}`;
  return [
    `<link rel="canonical" href="${esc(url)}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : '<meta name="robots" content="index, follow, max-image-preview:large" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="BillX" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(SITE.url)}/og.png" />`,
    '<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />',
    '<meta property="og:locale" content="en_IN" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(SITE.url)}/og.png" />`,
    SITE.googleVerification ? `<meta name="google-site-verification" content="${esc(SITE.googleVerification)}" />` : '',
    ...jsonLd.map(ld),
  ].filter(Boolean).join('\n    ');
}

/* ---------------- home page pieces ---------------- */

export const homeHead = () => headTags({
  title: 'BillX: GST billing & invoicing software for every business',
  description: 'GST billing and invoicing software for shops, hospitals, clinics, restaurants, hotels, schools, garages, salons, agencies and 45 business types.',
  jsonLd: [orgJsonLd(), appJsonLd('BillX', 'GST billing and invoicing software for 45 business types: invoices, quotes, receipts, UPI QR, client portal and reports.'), faqJsonLd(homeFaq())],
});

export function plansHTML(period = 'monthly', segment = 'small') {
  return (segment ? plansIn(segment) : Object.entries(PLANS)).map(([k, p]) => `
    <div class="l-plan${p.popular ? ' popular' : ''}">
      ${p.popular ? '<span class="l-badge">Most popular</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="l-for">${esc(p.for)}</p>
      <div class="l-price">${rupees(period === 'yearly' ? p.yearly : p.monthly)}<small>/${period === 'yearly' ? 'year' : 'month'}</small></div>
      ${period === 'yearly' ? `<p class="l-save">${rupees(Math.round(p.yearly / 12))}/month, billed yearly</p>` : '<p class="l-save">&nbsp;</p>'}
      <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      <a class="btn ${p.popular ? 'primary' : 'dark'} block l-sub-btn" href="pay.html?plan=${k}&period=${period}">Subscribe now</a>
      <a class="l-paynow" href="app/#/signup?plan=${k}&period=${period}">${CLOUD ? `or try free for ${TRIAL_DAYS} days` : 'or start free'}</a>
    </div>`).join('');
}

export function sectorsHTML(linkBase = '') {
  return groupedIndustries().map(([g, list]) => `<div class="l-sector-group"><b>${esc(g)}</b>
    <span>${list.filter(([k]) => SECTORS[k]).map(([k, v]) => `<a href="${linkBase}${sectorPath(k)}">${esc(v.name)}</a>`).join(' · ')}</span></div>`).join('');
}

export const faqHTML = (faq = homeFaq()) => faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');

export const isCloud = () => CLOUD;

/** Brand lock-up used in every header. */
export const brandHTML = (href) => `<a class="l-brand" href="${href}" aria-label="BillX by BillX Solutions, home"><img src="${href === '/' ? '/logo.svg' : 'logo.svg'}" alt="" width="34" height="34" /><span class="l-brand-text"><span class="l-brand-name">Bill<b>X</b></span><small>by ${esc(SITE.company)}</small></span></a>`;

/** Site header for the standalone SEO pages. */
export function navHTML() {
  return `<header class="l-nav"><div class="l-nav-in">${brandHTML('/')}
    <nav class="l-menu"><a href="/#features">Features</a><a href="/billing-software/">Industries</a><a href="/#pricing">Pricing</a><a href="/free-gst-invoice-generator/">Free invoice tool</a></nav>
    <div class="l-nav-cta">${CLOUD ? '<a class="btn ghost" href="/app/">Sign in</a>' : ''}<a class="btn primary" href="/app/#/signup">${startShort()}</a></div></div></header>`;
}

const STRIP = [['hospital', 'heart', 'Hospitals'], ['clinic', 'heart', 'Clinics'], ['pharmacy', 'pill', 'Pharmacies'], ['retail', 'bag', 'Retail shops'],
  ['restaurant', 'utensils', 'Restaurants'], ['hotel', 'bed', 'Hotels'], ['automobile', 'wrench', 'Garages'], ['salon', 'scissors', 'Salons'],
  ['education', 'cap', 'Schools'], ['services', 'briefcase', 'Agencies'], ['construction', 'hardhat', 'Builders'], ['transport', 'truck', 'Transport']];

/** "Built for" strip of key industries, linking to their pages. */
export function industryStripHTML(linkBase = '') {
  return STRIP.map(([k, ic, label]) => `<a class="l-ind" href="${linkBase}${sectorPath(k)}"><i data-li="${ic}" data-size="20"></i><span>${label}</span></a>`).join('');
}

/** Company footer, shared by the home page and the SEO pages. */
export function footerHTML(linkBase = '') {
  const top = ['retail', 'hospital', 'clinic', 'pharmacy', 'restaurant', 'hotel', 'automobile', 'salon', 'education', 'jewellery'];
  const home = linkBase || './';
  const wa = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hi, I want to know more about BillX.')}` : '';
  return `<footer class="l-footer"><div class="l-footer-in">
    <div class="l-footer-brand">${brandHTML(home)}
      <p>GST billing &amp; invoicing software for every kind of business: invoices, quotes, receipts, UPI payments and reports in one place.</p>
      <p class="l-footer-contact"><i data-li="pin" data-size="16"></i> ${esc(SITE.city)}</p>
      ${wa ? `<p class="l-footer-contact"><i data-li="chat" data-size="16"></i> <a href="${wa}" target="_blank" rel="noopener">WhatsApp +${esc(SITE.whatsapp.replace(/^91/, '91 '))}</a></p>` : ''}
      ${SITE.email ? `<p class="l-footer-contact"><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></p>` : ''}
    </div>
    <div><h4>Product</h4><a href="${home}#features">Features</a><a href="${home}#pricing">Pricing</a><a href="${linkBase}free-gst-invoice-generator/">Free GST invoice generator</a><a href="${linkBase}pay.html">Buy BillX</a><a href="${linkBase}app/">Open the app</a></div>
    <div><h4>Industries</h4>${top.map((k) => `<a href="${linkBase}${sectorPath(k)}">${esc(INDUSTRIES[k].name)}</a>`).join('')}<a href="${linkBase}billing-software/">All 44 business types →</a></div>
    <div><h4>Company</h4><a href="${linkBase}billing-software-kerala/">Billing software in Kerala</a><a href="${linkBase}legal/contact.html">Contact us</a><a href="${linkBase}legal/terms.html">Terms of service</a><a href="${linkBase}legal/privacy.html">Privacy policy</a><a href="${linkBase}legal/refund.html">Refunds &amp; cancellation</a></div>
  </div>
  <div class="l-footer-bar"><span>© ${new Date().getFullYear()} ${esc(SITE.company)}. All rights reserved.</span><span>Made in ${esc(SITE.city.split(',')[0])}, Kerala</span></div></footer>`;
}

/** Kept for older templates: the footer's link columns. */
export const footLinksHTML = (linkBase = '') => footerHTML(linkBase);

/* ---------------- standalone landing pages ---------------- */

const SEO_CSS_LINKS = '<link rel="stylesheet" href="/seo.css" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />';

function page({ title, description, path, jsonLd, body, crumbs }) {
  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1e3a8a" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="icon" href="/logo.svg" type="image/svg+xml" />
    ${headTags({ title, description, path, jsonLd: [...jsonLd, crumbsJsonLd(crumbs)] })}
    ${SEO_CSS_LINKS}
  </head>
  <body class="landing">
    ${navHTML()}
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs.map(([n, p], i) => (i < crumbs.length - 1 ? `<a href="/${p}">${esc(n)}</a> › ` : `<span>${esc(n)}</span>`)).join('')}</nav>
    <main class="seo">${body}</main>
    <section class="l-cta-band"><div class="l-cta-in"><h2>Start billing like a professional today</h2>
      <p>Set up in a minute. Your logo, GST details and UPI QR on every bill.</p>
      <div class="l-cta"><a class="btn white big" href="/app/#/signup">${startCTA()}</a><a class="btn outline-white big" href="/app/?guest=1#/new/invoice">Try the free invoice generator</a></div></div></section>
    ${footerHTML('/')}
    ${SITE.whatsapp ? `<a class="l-wa" href="https://wa.me/${esc(SITE.whatsapp)}?text=${encodeURIComponent('Hi, I want to know more about BillX.')}" target="_blank" rel="noopener">WhatsApp us</a>` : ''}
  </body>
</html>`;
}

function sampleSettings(key) {
  const p = INDUSTRIES[key];
  const hide = Object.fromEntries((p.hide || []).map((h) => [h, false]));
  return {
    industry: key, clientLabel: p.clientLabel, currency: 'INR', taxMode: 'gst', roundOff: true, taxInclusive: false,
    business: { name: p.sampleName || `Sample ${p.name.split(/ [/(]/)[0]}`, tagline: '', address: 'Market Road', city: 'Palakkad', state: '32', pincode: '678001', phone: '+91 98470 00000', gstin: p.tax ? '32ABCDE1234F1Z5' : '', upiId: 'business@upi', bankName: 'State Bank of India', accountNo: '00000012345678', ifsc: 'SBIN0000001' },
    docTitles: { invoice: p.docTitle }, footer: '',
    design: { template: p.template, accent: p.accent, font: 'inter', paper: p.template === 'thermal' ? '80mm' : 'A4', show: { ...DEFAULT_SHOW, ...hide }, labels: { ...(p.labels || {}) }, groupByCategory: !!p.groupByCategory },
  };
}

function sampleInvoiceHTML(key) {
  const p = INDUSTRIES[key];
  const doc = {
    type: 'invoice', number: 'INV-0042', status: 'sent', date: '2026-11-17', dueDate: '2026-12-02', placeOfSupply: '32',
    client: { name: `${p.clientLabel === 'Patient' ? 'Anil Kumar' : 'Ravi Menon'}`, address: 'Fort Road', city: 'Palakkad', state: '32', phone: '+91 90000 12345', extra: Object.fromEntries(p.clientFields.map((f) => [f.key, sampleValue(f) || ''])) },
    fields: Object.fromEntries(p.fields.map((f) => [f.key, sampleValue(f, 0, '2026-11-14') || ''])),
    items: starterItems(key).slice(0, 4).map((it, i) => ({ ...it, qty: i === 1 ? 2 : 1, rate: it.rate || 500, discount: 0, ...Object.fromEntries(p.itemCols.filter((c) => !c.hidden).map((c) => [c.key, sampleValue(c) || ''])) })),
    payments: [],
  };
  return renderInvoice(doc, sampleSettings(key)).html;
}

function sectorPage(key) {
  const p = INDUSTRIES[key];
  const [slug, audience] = SECTORS[key];
  const Aud = audience.split(' ').map((w) => (w === '&' || w === 'and' ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
  const path = `billing-software/${slug}/`;
  const fields = p.fields.map((f) => f.label);
  const cfields = p.clientFields.map((f) => f.label);
  const cols = p.itemCols.filter((c) => !c.hidden).map((c) => c.label);
  const long = `Billing Software for ${Aud} | GST ${p.docTitle} App · BillX`;
  const title = long.length <= 65 ? long : `Billing Software for ${Aud} · BillX`;
  const description = `GST billing software for ${audience}: ${p.docTitle.toLowerCase()}s with ${[...fields.slice(0, 3), ...cols.slice(0, 2)].join(', ') || 'your own fields'}, UPI QR and 10 designs. ${trialNote()}, from ${rupees(minPrice)}/month.`.slice(0, 300);
  const faq = [
    [`Is BillX GST compliant for ${audience}?`, `Yes. Every ${p.docTitle.toLowerCase()} shows your GSTIN, HSN/SAC codes, place of supply and CGST + SGST or IGST, with a GST summary and amount in words. The default GST rate for this business type is ${p.tax}%, and you can set any rate per item.`],
    [`What details can I add to a ${p.docTitle.toLowerCase()}?`, `${fields.length ? `${fields.join(', ')} on every bill` : 'Any details you need'}${cfields.length ? `; ${cfields.join(', ')} saved for each ${p.clientLabel.toLowerCase()}` : ''}${cols.length ? `; and item columns for ${cols.join(', ')}` : ''}. You can rename, add or remove any field in Settings.`],
    ...(CLOUD ? [['Can my staff use it too?', 'Yes. Add staff by email and they sign in with their own login. Everyone sees the same bills, updated live, on phone or computer.']] : []),
    [`How do my ${p.clientLabel.toLowerCase()}s pay?`, 'Every bill carries a UPI QR code and a pay button. You can also share a private link where they see all their bills and their balance, download PDFs and confirm payment on WhatsApp.'],
    ['How much does it cost?', `Small businesses: ${plansIn('small').map(([, x]) => `${x.name} ${rupees(x.monthly)}/month`).join(', ')}. Large businesses: ${plansIn('large').map(([, x]) => `${x.name} ${rupees(x.monthly)}/month`).join(', ')}${GST_RATE ? ' plus GST' : ''}. ${CLOUD ? `Every plan starts with a ${TRIAL_DAYS}-day free trial.` : 'You can start free and upgrade any time.'}`],
  ];
  const items = starterItems(key);
  const related = Object.entries(INDUSTRIES).filter(([k, v]) => v.group === p.group && k !== key && SECTORS[k]);
  const body = `
    <section class="seo-hero">
      <div>
        <p class="l-eyebrow">${esc(p.group)}</p>
        <h1>GST billing software for ${esc(audience)}</h1>
        <p class="l-lead">Make ${esc(p.docTitle.toLowerCase())}s for your ${esc(p.clientLabel.toLowerCase())}s in seconds${fields.length ? `, with ${esc(fields.slice(0, 4).join(', '))} on every bill` : ''}. Customers pay by scanning the UPI QR, and BillX tracks who still owes you.</p>
        <div class="l-cta"><a class="btn primary big" href="/app/#/signup">${startCTA()}</a><a class="btn big" href="/app/?guest=1#/">Try free, no sign-up</a></div>
        <p class="l-small">From ${rupees(minPrice)}/month · Works on phone & computer · Pay by UPI, GPay or bank transfer</p>
      </div>
      <figure class="seo-inv" aria-label="Sample ${esc(p.docTitle)} for ${esc(audience)}"><div class="seo-inv-zoom">${sampleInvoiceHTML(key)}</div><figcaption>A sample ${esc(p.docTitle.toLowerCase())} in the ${esc(p.template)} design</figcaption></figure>
    </section>
    <section class="seo-sec">
      <h2>Built for how ${esc(audience)} bill</h2>
      <div class="l-features">
        <div><b>Your details on every bill</b><p>${fields.length ? `${esc(fields.join(', '))}.` : 'Add any fields you need.'} Add, rename or remove fields any time.</p></div>
        <div><b>${esc(p.clientLabel)} records</b><p>Save each ${esc(p.clientLabel.toLowerCase())} once${cfields.length ? ` with ${esc(cfields.join(', '))}` : ''}, and see their full history and balance.</p></div>
        <div><b>${cols.length ? 'Item columns you need' : 'Fast item entry'}</b><p>${cols.length ? `${esc(cols.join(', '))} columns, plus HSN/SAC, quantity, rate, discount and GST.` : 'Pick saved items to fill rate, GST and HSN automatically.'}</p></div>
        <div><b>GST at ${p.tax}% by default</b><p>CGST + SGST within Kerala, IGST for other states, picked automatically. Any rate per item.</p></div>
        <div><b>Get paid faster</b><p>UPI QR on every bill, part payments, overdue alerts and a private customer portal.</p></div>
        <div><b>Reports</b><p>Sales and collections by month, GST by rate for GSTR-1/3B, money owed by age, top ${esc(p.clientLabel.toLowerCase())}s.</p></div>
      </div>
    </section>
    <section class="seo-sec">
      <h2>Ready-made item list</h2>
      <p>BillX starts you with typical items for ${esc(audience)}. Change prices or add your own.</p>
      <div class="table-wrap"><table class="table"><thead><tr><th>Item / service</th><th>Unit</th><th class="num">Sample rate</th><th class="num">GST</th><th>HSN/SAC</th></tr></thead>
      <tbody>${items.map((it) => `<tr><td>${esc(it.name)}</td><td>${esc(it.unit)}</td><td class="num">${it.rate ? rupees(it.rate) : '–'}</td><td class="num">${it.tax}%</td><td>${esc(it.hsn)}</td></tr>`).join('')}</tbody></table></div>
    </section>
    <section class="seo-sec"><h2>Pricing</h2><div class="l-plans">${plansHTML('monthly', null).replaceAll('href="app/', 'href="/app/').replaceAll('href="pay.html', 'href="/pay.html')}</div></section>
    <section class="seo-sec"><h2>Questions from ${esc(audience)}</h2><div class="l-faq">${faqHTML(faq)}</div></section>
    ${related.length ? `<section class="seo-sec"><h2>Also used by</h2><p class="seo-links">${related.map(([k, v]) => `<a href="/${sectorPath(k)}">${esc(v.name)}</a>`).join('')}<a href="/billing-software/">All business types</a></p></section>` : ''}`;
  return {
    path, html: page({
      title, description, path, body,
      jsonLd: [appJsonLd(`BillX for ${Aud}`, description), faqJsonLd(faq)],
      crumbs: [['BillX', ''], ['Billing software', 'billing-software/'], [Aud, path]],
    }),
  };
}

function hubPage() {
  const path = 'billing-software/';
  const body = `<section class="seo-sec"><h1>Billing software for every kind of business</h1>
    <p class="l-lead">Pick your business type to see the fields, items, GST rates and invoice design BillX prepares for you.</p>
    ${groupedIndustries().map(([g, list]) => `<h2>${esc(g)}</h2><p class="seo-links">${list.filter(([k]) => SECTORS[k]).map(([k]) => `<a href="/${sectorPath(k)}">Billing software for ${esc(SECTORS[k][1])}</a>`).join('')}</p>`).join('')}
  </section>`;
  return {
    path, html: page({
      title: 'Billing Software for 44 Business Types | GST Invoicing · BillX',
      description: 'GST billing and invoicing software for retail, healthcare, restaurants, hotels, services, garages, salons, schools, builders, transport and more.',
      path, body, jsonLd: [appJsonLd()], crumbs: [['BillX', ''], ['Billing software', path]],
    }),
  };
}

function generatorPage() {
  const path = 'free-gst-invoice-generator/';
  const faq = [
    ['Is this GST invoice generator really free?', `Yes. Use it without an account: create, print and download GST invoices as PDF. Your bills stay on your device. ${CLOUD ? 'Create an account when you want cloud backup, staff logins and reports.' : 'Download a backup from Settings any time.'}`],
    ['What must a GST invoice contain?', 'Supplier name, address and GSTIN; a unique invoice number and date; customer name and address (and GSTIN if registered); HSN/SAC codes; quantity and value of goods or services; taxable value; GST rate and amount (CGST + SGST, or IGST for inter-state); place of supply; total in figures and words; and the signature of the supplier.'],
    ['When do I charge CGST + SGST or IGST?', 'CGST + SGST when the supplier and the place of supply are in the same state; IGST when they are in different states. BillX picks this automatically from the place of supply.'],
    ['Can I add my logo and UPI QR code?', 'Yes. Upload your logo and signature, choose one of 10 designs, and add your UPI ID to print a scan-to-pay QR on every invoice.'],
  ];
  const body = `
    <section class="seo-hero"><div>
      <p class="l-eyebrow">Free tool</p>
      <h1>Free GST invoice generator</h1>
      <p class="l-lead">Create a professional GST invoice in under a minute: CGST/SGST/IGST worked out for you, amount in words, UPI QR, your logo. Print it or save it as a PDF. No sign-up needed.</p>
      <div class="l-cta"><a class="btn primary big" href="/app/?guest=1#/new/invoice">Create a free invoice</a><a class="btn big" href="/app/#/signup">${startShort()}</a></div>
    </div><figure class="seo-inv"><div class="seo-inv-zoom">${sampleInvoiceHTML('retail')}</div><figcaption>An invoice made with the free generator</figcaption></figure></section>
    <section class="seo-sec"><h2>How to make a GST invoice</h2><ol class="seo-steps">
      <li><b>Add your business:</b> name, address, GSTIN, state, logo and UPI ID (once).</li>
      <li><b>Add the customer:</b> name, address, GSTIN and state (place of supply).</li>
      <li><b>Add items:</b> description, HSN/SAC, quantity, rate and GST %. Discounts and charges are optional.</li>
      <li><b>Check the totals:</b> taxable value, CGST + SGST or IGST, round off and the amount in words are calculated for you.</li>
      <li><b>Download or share:</b> print, save as PDF, or send a link on WhatsApp with a pay-by-UPI button.</li>
    </ol></section>
    <section class="seo-sec"><h2>Invoice formats included</h2><p>Tax invoice, bill of supply, quotation / estimate, proforma invoice, payment receipt and credit note, in 10 designs including a classic GST boxed format and an 80 mm thermal receipt.</p></section>
    <section class="seo-sec"><h2>Questions</h2><div class="l-faq">${faqHTML(faq)}</div></section>`;
  return {
    path, html: page({
      title: 'Free GST Invoice Generator: Create & Download PDF · BillX',
      description: 'Free online GST invoice generator: create GST invoices with CGST/SGST/IGST, HSN codes, amount in words, logo and UPI QR. Print or download PDF, no sign-up.',
      path, body,
      jsonLd: [faqJsonLd(faq), {
        '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to make a GST invoice',
        step: ['Add your business details', 'Add the customer and place of supply', 'Add items with HSN, quantity, rate and GST', 'Check taxable value and GST totals', 'Download as PDF or share'].map((t, i) => ({ '@type': 'HowToStep', position: i + 1, name: t })),
      }],
      crumbs: [['BillX', ''], ['Free GST invoice generator', path]],
    }),
  };
}

function keralaPage() {
  const path = 'billing-software-kerala/';
  const cities = ['Palakkad', 'Kochi', 'Thrissur', 'Kozhikode', 'Thiruvananthapuram', 'Kollam', 'Kannur', 'Malappuram', 'Kottayam', 'Alappuzha', 'Pathanamthitta', 'Idukki', 'Wayanad', 'Kasaragod'];
  const faq = [
    ['Is BillX made in Kerala?', `Yes. BillX is built and supported by ${SITE.company} in ${SITE.city}.`],
    ['Does it handle Kerala GST correctly?', 'Yes. Sales within Kerala get CGST + SGST; sales to other states get IGST, picked automatically from the place of supply (state code 32 for Kerala).'],
    ['Can you help us set it up?', 'Yes. On the Pro plan we set up your logo, designs and items, move data from your old software and train your staff.'],
  ];
  const body = `
    <section class="seo-sec"><p class="l-eyebrow">Made in Palakkad</p><h1>Billing software in Kerala</h1>
      <p class="l-lead">GST billing and invoicing for shops, hospitals, clinics, restaurants, hotels, schools and service businesses across Kerala, with support from ${esc(SITE.city)}.</p>
      <div class="l-cta"><a class="btn primary big" href="/app/#/signup">${startCTA()}</a>${SITE.whatsapp ? `<a class="btn big" href="https://wa.me/${esc(SITE.whatsapp)}?text=${encodeURIComponent('Hi, I want a BillX demo.')}">Book a demo on WhatsApp</a>` : ''}</div></section>
    <section class="seo-sec"><h2>Serving businesses across Kerala</h2><p class="seo-links">${cities.map((c) => `<span>${c}</span>`).join('')}</p></section>
    <section class="seo-sec"><h2>Popular in Kerala</h2><p class="seo-links">${['hospital', 'clinic', 'pharmacy', 'retail', 'textile', 'jewellery', 'restaurant', 'bakery', 'hotel', 'automobile', 'education', 'construction'].map((k) => `<a href="/${sectorPath(k)}">${esc(INDUSTRIES[k].name)}</a>`).join('')}</p></section>
    <section class="seo-sec"><h2>Pricing</h2><div class="l-plans">${plansHTML('monthly', null).replaceAll('href="app/', 'href="/app/').replaceAll('href="pay.html', 'href="/pay.html')}</div></section>
    <section class="seo-sec"><h2>Questions</h2><div class="l-faq">${faqHTML(faq)}</div></section>`;
  return {
    path, html: page({
      title: 'Billing Software in Kerala | GST Billing App, Palakkad · BillX',
      description: `GST billing software for Kerala businesses in Palakkad, Kochi, Thrissur, Kozhikode and more. Invoices, UPI QR, reports. ${trialNote()}.`,
      path, body, jsonLd: [orgJsonLd(), faqJsonLd(faq)], crumbs: [['BillX', ''], ['Billing software in Kerala', path]],
    }),
  };
}

export function seoPages() {
  return [hubPage(), generatorPage(), keralaPage(), ...Object.keys(SECTORS).filter((k) => INDUSTRIES[k]).map(sectorPage)];
}

export function sitemapXML(paths) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ['', 'pay.html', ...paths, 'legal/terms.html', 'legal/privacy.html', 'legal/refund.html', 'legal/contact.html'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${esc(`${SITE.url}/${p}`)}</loc><lastmod>${today}</lastmod><priority>${p === '' ? '1.0' : p.startsWith('legal') ? '0.3' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`;
}

export const robotsTXT = () => `User-agent: *
Allow: /
Disallow: /app/
Disallow: /admin.html
Disallow: /portal.html
Disallow: /api/

Sitemap: ${SITE.url}/sitemap.xml
`;
