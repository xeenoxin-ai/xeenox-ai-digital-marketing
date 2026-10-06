// usage: node render.js <h> <outPrefix> [times...]  (no times => full 30fps frames piped to stdout as png)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [h, out, ...times] = process.argv.slice(2);
  const H = +h;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: H } });
  await p.goto('file://' + path.resolve('drheal.html') + '?h=' + H);
  await p.evaluate(() => window.ready);
  if (times.length) {
    for (const t of times) { await p.evaluate(t => render(t), +t); await p.screenshot({ path: `${out}_${t}.png` }); }
  } else {
    const fps = 30, N = 30 * fps;
    for (let i = 0; i < N; i++) {
      await p.evaluate(t => render(t), i / fps);
      const buf = await p.screenshot({ type: 'png' });
      if (!process.stdout.write(buf)) await new Promise(r => process.stdout.once('drain', r));
      if (i % 150 === 0) process.stderr.write(`frame ${i}\n`);
    }
  }
  await b.close();
})();
