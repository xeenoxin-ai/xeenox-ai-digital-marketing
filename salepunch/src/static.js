// Dashboard files, bundled into the worker (no separate asset upload needed).
import indexHtml from '../public/index.html';
import landingHtml from '../public/landing.html';
import downloadHtml from '../public/download.html';
import appJs from '../public/app.js';
import appCss from '../public/app.css';
import logoSvg from '../public/logo.svg';
import apk from '../public/salepunch.apk';

// Short content hash, so each deploy gets new script/style URLs and browsers
// never keep running an old copy of the app after an update.
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
const V = hash(appJs + appCss);
const appHtml = indexHtml.replace('/app.js"', `/app.js?v=${V}"`).replace('/app.css"', `/app.css?v=${V}"`);

const HTML = 'text/html; charset=utf-8';
const FILES = {
  '/': [landingHtml, HTML],
  '/app': [appHtml, HTML],
  '/download': [downloadHtml, HTML],
  '/download/': [downloadHtml, HTML],
  '/app/': [appHtml, HTML],
  '/app.js': [appJs, 'text/javascript; charset=utf-8'],
  '/app.css': [appCss, 'text/css; charset=utf-8'],
  '/logo.svg': [logoSvg, 'image/svg+xml'],
};

export function serveStatic(pathname, search = '') {
  if (pathname === '/download/salepunch.apk' || pathname === '/download/SalePunch.apk') {
    return new Response(apk, {
      headers: {
        'content-type': 'application/vnd.android.package-archive',
        'content-disposition': 'attachment; filename="SalePunch.apk"',
        'cache-control': 'no-cache',
        'x-content-type-options': 'nosniff',
      },
    });
  }
  const f = FILES[pathname];
  if (!f) return new Response('Not found', { status: 404 });
  // Pages are always re-checked. Versioned script/style URLs can be cached for a
  // long time (a new deploy changes the URL); unversioned ones are re-checked.
  const versioned = search.includes('v=');
  const cache = f[1] === HTML || !versioned ? 'no-cache, must-revalidate' : 'public, max-age=31536000, immutable';
  return new Response(f[0], {
    headers: {
      'content-type': f[1],
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'same-origin',
    },
  });
}
