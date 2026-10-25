// Render every EasyWay graphic from public/logo.svg with headless Chromium
// (Playwright): web/PWA icons, Android launcher + splash images, and the
// Play Store icon and feature graphic.
//
// Run from the repo root: node scripts/make-icons.mjs
// Needs Playwright with Chromium installed (dev machines only).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { globSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const RES = 'android/app/src/main/res';
const logo = readFileSync('public/logo.svg', 'utf8');
const mark = logo.match(/<g id="mark">[\s\S]*?<\/g>/)[0];
const GRADIENT = 'linear-gradient(135deg, #34d399 0%, #059669 55%, #065f46 100%)';

// The mark alone (512 units), scaled and centred in a size×size box.
const markSvg = (size, scale) => {
  const s = (size * scale) / 512;
  const off = (size - 512 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><g transform="translate(${off} ${off}) scale(${s})">${mark}</g></svg>`;
};

const page = await (await chromium.launch()).newPage();

async function render(html, width, height, path, { transparent = false } = {}) {
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<html><body style="margin:0;width:${width}px;height:${height}px;overflow:hidden;background:${transparent ? 'transparent' : '#fff'}">${html}</body></html>`,
  );
  await page.screenshot({ path, omitBackground: transparent });
}

const box = (size, radius, scale) =>
  `<div style="width:${size}px;height:${size}px;border-radius:${radius};background:${GRADIENT};display:grid;place-items:center">${markSvg(size, scale)}</div>`;

// Web / PWA: rounded icon ("any") and full-bleed square ("maskable").
for (const size of [192, 512]) {
  await render(box(size, `${size * 0.22}px`, 0.9), size, size, `public/icon-${size}.png`, { transparent: true });
}
await render(box(512, '0', 0.72), 512, 512, 'public/icon-maskable-512.png');

// Android launcher icons.
const DENSITY = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [name, k] of Object.entries(DENSITY)) {
  const dir = `${RES}/mipmap-${name}`;
  const s = Math.round(48 * k);
  await render(box(s, `${s * 0.22}px`, 0.9), s, s, `${dir}/ic_launcher.png`, { transparent: true });
  await render(box(s, '50%', 0.78), s, s, `${dir}/ic_launcher_round.png`, { transparent: true });
  // Adaptive foreground: the launcher crops to the centre 66%, so keep the mark inside it.
  const f = Math.round(108 * k);
  await render(markSvg(f, 0.6), f, f, `${dir}/ic_launcher_foreground.png`, { transparent: true });
}
writeFileSync(
  `${RES}/values/ic_launcher_background.xml`,
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#059669</color>\n</resources>\n',
);

// Splash screens: keep each file's size.
const sizeOf = (png) => {
  const b = readFileSync(png);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
};
for (const path of globSync(`${RES}/drawable*/splash.png`)) {
  const [w, h] = sizeOf(path);
  const m = Math.round(Math.min(w, h) * 0.32);
  await render(
    `<div style="width:${w}px;height:${h}px;background:${GRADIENT};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${m * 0.08}px;font-family:'DejaVu Sans',sans-serif;color:#fff">
      ${markSvg(m, 1)}<div style="font-size:${m * 0.26}px;font-weight:700;letter-spacing:-0.02em">EasyWay</div></div>`,
    w, h, path,
  );
}

// Play Store graphics.
mkdirSync('store', { recursive: true });
await render(box(512, '0', 0.8), 512, 512, 'store/play-icon-512.png');
const chip = (t) => `<span style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 20px;white-space:nowrap">${t}</span>`;
await render(
  `<div style="width:1024px;height:500px;background:${GRADIENT};display:flex;align-items:center;gap:56px;padding:0 72px;box-sizing:border-box;font-family:'DejaVu Sans',sans-serif;color:#fff">
    <div style="flex:none;width:300px;height:300px;border-radius:72px;background:rgba(255,255,255,.12);display:grid;place-items:center">${markSvg(300, 0.92)}</div>
    <div>
      <div style="font-size:96px;font-weight:700;letter-spacing:-0.03em;line-height:1">EasyWay</div>
      <div style="font-size:30px;margin:18px 0 28px;color:#d1fae5">The easiest way, every time.</div>
      <div style="display:flex;gap:12px;font-size:20px;font-weight:600">${chip('Beat traffic')}${chip('Skip tolls')}${chip('Breakdown help')}</div>
    </div></div>`,
  1024, 500, 'store/feature-graphic-1024x500.png',
);

await page.context().browser().close();
console.log('graphics written');
