// Renders index.html frame by frame.
//   node render.cjs video <out.mp4>            -> silent 30 fps H.264
//   node render.cjs stills <dir> t1 t2 ...     -> PNG stills at the given seconds
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const FPS = 30, DUR = 30;
const [mode, out, ...times] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => window.ready);
  const canvas = await page.$('canvas');

  if (mode === 'stills') {
    for (const t of times) {
      await page.evaluate(x => render(x), +t);
      await canvas.screenshot({ path: path.join(out, `still_${(+t).toFixed(2)}.png`) });
    }
  } else {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < FPS * DUR; f++) {
      await page.evaluate(x => render(x), f / FPS);
      const buf = await canvas.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 90 === 0) process.stdout.write(`frame ${f}\n`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
