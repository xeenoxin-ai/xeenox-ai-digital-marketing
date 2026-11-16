const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const [,, html, mode, out] = process.argv;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(html));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  if (errs.length) console.log('ERR', errs);
  if (mode === 'preview') {
    const ts = (process.env.TS||'1.5,2.6,4.2').split(',').map(Number);
    for (const t of ts) { await p.evaluate(t => render(t), t); await p.screenshot({ path: `${out}/f_${String(t).padStart(4,'0')}.png` }); }
  } else {
    const fps = 30, N = 30 * fps;
    const ff = spawn('ffmpeg', ['-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart', out], { stdio: ['pipe','ignore','inherit'] });
    for (let i = 0; i < N; i++) {
      await p.evaluate(t => render(t), i / fps);
      const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log('frame', i);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
