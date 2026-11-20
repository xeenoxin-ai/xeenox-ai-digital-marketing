// Intimacy for Couples: website build + Worker static serving + content sanity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

process.env.SITE_URL = 'https://example.test';
const { build } = await import('../intimacy/site/build.mjs');
build();
const worker = (await import('../intimacy/worker/index.js')).default;
const C = await import('../intimacy/app/content.js');

const get = (path) => worker.fetch(new Request('https://example.test' + path), {});

test('content decks are large and well-formed', () => {
  assert.ok(C.TRUTHS.length >= 50 && C.DARES.length >= 50);
  assert.ok(C.POSITIONS.length >= 55);
  assert.ok(C.LEARN.length >= 5 && C.HOT_TOPICS.length >= 8);
  assert.equal(new Set(C.POSITIONS.map((p) => p.id)).size, C.POSITIONS.length);
  for (const [h, t] of [...C.TRUTHS, ...C.DARES]) assert.ok(h >= 1 && h <= 4 && t.length > 5);
  for (const r of C.RATHER) assert.match(r[1], / — or /);
});

test('site pages are served with SEO tags', async () => {
  for (const p of ['/', '/truth-or-dare-for-couples/', '/sex-positions-for-couples/', '/what-women-like-in-bed/', '/sex-toys-for-couples/', '/privacy/']) {
    const r = await get(p);
    assert.equal(r.status, 200, p);
    const html = await r.text();
    assert.match(html, /<title>[^<]{10,}<\/title>/);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://example.test${p}">`));
    assert.match(html, /application\/ld\+json/);
  }
  const sm = await (await get('/sitemap.xml')).text();
  assert.match(sm, /https:\/\/example.test\/sex-tips-for-couples\//);
  const robots = await (await get('/robots.txt')).text();
  assert.match(robots, /Sitemap: https:\/\/example.test\/sitemap.xml/);
  assert.match(robots, /Disallow: \/admin\//);
  assert.doesNotMatch(sm, /\/admin\//);
});

test('app, redirects and 404', async () => {
  assert.equal((await get('/play/')).status, 200);
  assert.equal((await get('/play/app.js')).headers.get('content-type'), 'text/javascript; charset=utf-8');
  const r = await get('/play');
  assert.equal(r.status, 301);
  assert.equal((await get('/no-such-page')).status, 404);
  assert.equal((await get('/og.jpg')).headers.get('content-type'), 'image/jpeg');
});

test('api health and validation', async () => {
  assert.deepEqual(await (await get('/api/health')).json(), { ok: true });
  const r = await worker.fetch(new Request('https://example.test/api/ws?room=code:bad'), {});
  assert.equal(r.status, 426);
});

test('admin api refuses without a configured key', async () => {
  const r = await worker.fetch(new Request('https://example.test/api/admin/pending', { method: 'POST', body: JSON.stringify({ key: 'x'.repeat(20) }) }), {});
  assert.equal(r.status, 403);
});

test('app text escapes partner content', () => {
  const src = readFileSync(new URL('../intimacy/app/app.js', import.meta.url), 'utf8');
  assert.match(src, /\$\{esc\(m\.text\)\}/);
  assert.match(src, /\$\{esc\(c\.text\)\}/);
  assert.match(src, /\$\{esc\(x\.text\)\}/);
});
