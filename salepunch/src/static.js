// Dashboard files, bundled into the worker (no separate asset upload needed).
import indexHtml from '../public/index.html';
import landingHtml from '../public/landing.html';
import appJs from '../public/app.js';
import appCss from '../public/app.css';
import logoSvg from '../public/logo.svg';

const FILES = {
  '/': [landingHtml, 'text/html; charset=utf-8'],
  '/app': [indexHtml, 'text/html; charset=utf-8'],
  '/app/': [indexHtml, 'text/html; charset=utf-8'],
  '/app.js': [appJs, 'text/javascript; charset=utf-8'],
  '/app.css': [appCss, 'text/css; charset=utf-8'],
  '/logo.svg': [logoSvg, 'image/svg+xml'],
};

export function serveStatic(pathname) {
  const f = FILES[pathname];
  if (!f) return new Response('Not found', { status: 404 });
  return new Response(f[0], {
    headers: {
      'content-type': f[1],
      'cache-control': f[1].startsWith('text/html') ? 'no-cache' : 'public, max-age=300',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'same-origin',
    },
  });
}
