// Renders video.html frame by frame in headless Chromium and encodes with ffmpeg.
//   node render.cjs video <music.wav> <out.mp4>
//   node render.cjs stills <outDir> <t1,t2,...>
//   node render.cjs thumb <out.png>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, DUR = 30;
const FONTS = '/usr/share/fonts/opentype/inter';
const faces = [
  ['Disp', 'InterDisplay-Bold.otf', '700'],
  ['Disp', 'InterDisplay-ExtraBold.otf', '800'],
  ['Body', 'Inter-SemiBold.otf', '600'],
].map(([family, file, weight]) => ({ family, weight, b64: fs.readFileSync(path.join(FONTS, file)).toString('base64') }));

async function open() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'video.html'));
  await page.evaluate(async faces => {
    for (const f of faces) {
      const ff = new FontFace(f.family, `url(data:font/otf;base64,${f.b64})`, { weight: f.weight });
      await ff.load(); document.fonts.add(ff);
    }
  }, faces);
  return { browser, page };
}
const grab = (page, type) => page.evaluate(type => document.getElementById('c').toDataURL(type, .96), type)
  .then(u => Buffer.from(u.split(',')[1], 'base64'));

(async () => {
  const [mode, a, b] = process.argv.slice(2);
  const { browser, page } = await open();
  if (mode === 'stills') {
    fs.mkdirSync(a, { recursive: true });
    for (const t of b.split(',').map(Number)) {
      await page.evaluate(t => renderFrame(t), t);
      fs.writeFileSync(path.join(a, `f_${t.toFixed(2)}.png`), await grab(page, 'image/png'));
    }
  } else if (mode === 'thumb') {
    await page.evaluate(() => renderThumb());
    fs.writeFileSync(a, await grab(page, 'image/png'));
  } else {
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-i', a,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-maxrate', '9M', '-bufsize', '18M', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', b], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
    for (let f = 0; f < FPS * DUR; f++) {
      await page.evaluate(t => renderFrame(t), f / FPS);
      const jpg = await grab(page, 'image/jpeg');
      if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`frame ${f}/${FPS * DUR}`);
    }
    ff.stdin.end();
    await done;
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
