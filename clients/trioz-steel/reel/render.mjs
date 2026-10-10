// Renders index.html to a 30 s, 1080x1920, 30 fps H.264 MP4.
//
//   node render.mjs                 -> trioz-steel-reel-30s-9x16.mp4 + storyboard.jpg
//                                      (soundtrack: run `python3 music.py` first to build assets/music.m4a)
//   node render.mjs --serve         -> live preview at http://localhost:8642
//   node render.mjs --stills 1.5,8  -> PNG stills at the given seconds (for review)
//
// Needs Playwright (Chromium) and ffmpeg on PATH. Set PLAYWRIGHT_MODULE if playwright
// isn't resolvable from this folder (e.g. a global install).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const OUT = path.join(ROOT, 'trioz-steel-reel-30s-9x16.mp4');
const args = process.argv.slice(2);

const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end(); return;
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
const port = await new Promise(r => server.listen(args.includes('--serve') ? 8642 : 0, () => r(server.address().port)));

if (args.includes('--serve')) {
  console.log(`Preview: http://localhost:${port}/index.html`);
} else {
  const require = createRequire(import.meta.url);
  const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${port}/index.html?render`);
  await page.evaluate(() => window.ready);
  const duration = await page.evaluate(() => window.DURATION);

  const stillsArg = args[args.indexOf('--stills') + 1];
  if (args.includes('--stills')) {
    for (const s of stillsArg.split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), s);
      await page.screenshot({ path: path.join(ROOT, `still-${s}.png`) });
    }
  } else {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trioz-frames-'));
    const total = Math.round(duration * FPS);
    for (let f = 0; f < total; f++) {
      await page.evaluate(t => window.seek(t), f / FPS);
      // let swapped <img> sources decode before capture
      await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
      await page.screenshot({ path: path.join(dir, `${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
      if (f % 90 === 0) console.log(`frame ${f}/${total}`);
    }
    // soundtrack from music.py; falls back to a silent track if it hasn't been generated
    const music = path.join(ROOT, 'assets', 'music.m4a');
    const audioIn = fs.existsSync(music) ? ['-i', music] : ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000'];
    const audioCodec = fs.existsSync(music) ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '128k'];
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%04d.jpg'), ...audioIn,
      '-map', '0:v', '-map', '1:a', '-t', String(duration),
      '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow',
      '-r', String(FPS), ...audioCodec, '-movflags', '+faststart', OUT,
    ]);
    // storyboard: one frame from the middle of each scene beat
    const beats = [1.2, 2.4, 4.8, 8.0, 13.0, 18.0, 20.5, 23.6, 26.3, 29.5];
    const picks = beats.map(s => path.join(dir, `${String(Math.round(s * FPS)).padStart(4, '0')}.jpg`));
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', ...picks.flatMap(p => ['-i', p]),
      '-filter_complex', `${picks.map((_, i) => `[${i}:v]scale=324:576[v${i}]`).join(';')};${picks.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${picks.length}:layout=${picks.map((_, i) => `${(i % 5) * 324}_${Math.floor(i / 5) * 576}`).join('|')}`,
      '-frames:v', '1', '-q:v', '3', path.join(ROOT, 'storyboard.jpg'),
    ]);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Wrote ${OUT}`);
  }
  await browser.close();
  server.close();
}
