// BillX SEO pages: every page is complete, unique and in the sitemap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seoPages, sitemapXML, robotsTXT, homeHead, SECTORS } from '../billx/seo/content.mjs';
import { INDUSTRIES } from '../billx/src/industries.js';
import { SITE } from '../billx/src/site.js';
import { payDetailsHTML, confirmationText, payAmount } from '../billx/src/pay-details.js';

const pages = seoPages();

test('one landing page per business type, plus hub, generator and Kerala pages', () => {
  const sectorKeys = Object.keys(INDUSTRIES).filter((k) => k !== 'custom');
  assert.deepEqual(Object.keys(SECTORS).sort(), sectorKeys.sort(), 'every business type has a slug');
  assert.equal(pages.length, sectorKeys.length + 3);
  assert.equal(new Set(pages.map((p) => p.path)).size, pages.length, 'unique paths');
});

test('every page has title, description, canonical, one h1 and valid structured data', () => {
  const titles = new Set();
  for (const { path, html } of pages) {
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert.ok(!titles.has(title), `duplicate title ${title}`);
    titles.add(title);
    const desc = html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(desc.length >= 70 && desc.length <= 320, `${path} description length ${desc.length}`);
    assert.ok(html.includes(`<link rel="canonical" href="${SITE.url}/${path}" />`), `${path} canonical`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${path} has one h1`);
    const blocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
    assert.ok(blocks.length >= 2, `${path} json-ld`);
    for (const b of blocks) JSON.parse(b.replace(/^<script[^>]*>|<\/script>$/g, ''));
    assert.ok(!/<script(?! type="application\/ld\+json")/.test(html), `${path} needs no JavaScript`);
  }
});

test('sitemap lists every page; robots blocks the app and admin', () => {
  const xml = sitemapXML(pages.map((p) => p.path));
  for (const p of pages) assert.ok(xml.includes(`<loc>${SITE.url}/${p.path}</loc>`), p.path);
  assert.ok(robotsTXT().includes('Disallow: /admin.html'));
  assert.ok(robotsTXT().includes(`Sitemap: ${SITE.url}/sitemap.xml`));
  assert.ok(homeHead().includes('"@type":"FAQPage"'));
});

test('bank and UPI details are never in the public code; shown only when passed in', () => {
  assert.deepEqual(Object.keys(SITE.pay), ['payee'], 'site config holds no account, UPI or GPay details');
  const pub = payDetailsHTML('pro', 'monthly');
  assert.ok(pub.includes('Get payment details on WhatsApp'));
  assert.ok(!/\d{9,}/.test(pub.replace(/wa\.me\/\d+/, '')), 'no long account-like numbers on the public box');
  const sample = { payee: 'Test Co', gpay: '9000000001', accountNo: '00001112223', accountName: 'Test Owner', ifsc: 'TEST0000001' };
  const priv = payDetailsHTML('pro', 'monthly', sample);
  for (const v of ['Test Co', '9000000001', '00001112223', 'TEST0000001', '₹3,999']) assert.ok(priv.includes(v), v);
  assert.equal(payAmount('pro', 'yearly'), SITE.gstin ? 47188.2 : 39990);
  const msg = confirmationText({ plan: 'business', period: 'monthly', utr: '412345678901', name: 'Ravi' });
  assert.ok(msg.includes('UTR: 412345678901') && msg.includes('Business (monthly)'));
});
