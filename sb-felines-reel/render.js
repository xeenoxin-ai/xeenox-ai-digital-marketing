// Renders anim.js frame-by-frame in headless Chromium and pipes PNGs to ffmpeg.
// Usage: node render.js <out.mp4> [fps] [stillTimes...]   (with stills: writes PNGs instead)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const dir = __dirname;
const out = process.argv[2] || path.join(dir, 'video_noaudio.mp4');
const fps = +(process.argv[3] || 60);
const stills = process.argv.slice(4).map(Number);
const DUR = 30;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.setContent('<html><body style="margin:0"><canvas id="c" width="1080" height="1920"></canvas></body></html>');
  await page.addScriptTag({ content: fs.readFileSync(path.join(dir, 'anim.js'), 'utf8') });
  const map = {};
  for (const f of fs.readdirSync(path.join(dir, 'emoji'))) {
    map[f.replace('.svg', '')] = 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(dir, 'emoji', f)).toString('base64');
  }
  await page.evaluate(async m => { await document.fonts.ready; await window.loadEmojis(m); }, map);
  const grab = t => page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/png'); }, t);

  if (stills.length) {
    for (const t of stills) fs.writeFileSync(`${out}_${t}.png`, Buffer.from((await grab(t)).split(',')[1], 'base64'));
    await browser.close(); return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = DUR * fps;
  for (let i = 0; i < N; i++) {
    const png = Buffer.from((await grab(i / fps)).split(',')[1], 'base64');
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 120 === 0) console.log(`frame ${i}/${N}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
})();
