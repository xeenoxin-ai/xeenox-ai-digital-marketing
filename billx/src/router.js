// Hash router with an unsaved-changes guard.
import { esc } from './templates.js';

const routes = [];
let dirty = false;
let current = location.hash;
let skipNext = false;

export function route(pattern, view) {
  routes.push({ parts: pattern.split('/').filter(Boolean), view });
}

/** Match '/docs/:type?' style patterns against a path; returns params or null. */
export function matchRoute(parts, path) {
  const xs = path.split('/').filter(Boolean);
  const params = {};
  if (xs.length > parts.length) return null;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const x = xs[i];
    if (p.startsWith(':')) {
      const optional = p.endsWith('?');
      const key = p.slice(1).replace('?', '');
      if (x === undefined) { if (!optional) return null; params[key] = ''; continue; }
      params[key] = decodeURIComponent(x);
    } else if (p !== x) return null;
  }
  return params;
}

export const setDirty = (v) => { dirty = v; };

export function navigate(hash, { replace = false } = {}) {
  if (replace) {
    history.replaceState(null, '', hash);
    resolve();
  } else if (location.hash === hash) resolve();
  else location.hash = hash;
}

export function setPage(title, actions = '') {
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageActions').innerHTML = actions;
  document.title = `${title} · BillX`;
}

export function resolve() {
  const [path, qs] = (location.hash.slice(1) || '/').split('?');
  const query = new URLSearchParams(qs || '');
  const main = document.getElementById('view');
  for (const r of routes) {
    const params = matchRoute(r.parts, path);
    if (!params) continue;
    dirty = false;
    current = location.hash;
    document.querySelectorAll('.nav a').forEach((a) => {
      const base = a.getAttribute('href').split('/')[1];
      a.classList.toggle('on', path.split('/')[1] === base || (base === 'docs' && ['doc', 'edit', 'new'].includes(path.split('/')[1])) || (base === 'clients' && path.split('/')[1] === 'client'));
    });
    document.body.classList.remove('nav-open');
    document.querySelectorAll('dialog.modal').forEach((d) => d.remove());
    main.scrollTop = 0;
    window.scrollTo(0, 0);
    try {
      r.view(main, params, query);
    } catch (e) {
      console.error(e);
      main.innerHTML = `<div class="empty"><p>Something went wrong showing this page.</p><pre class="err">${esc(e.message)}</pre><a class="btn" href="#/">Go to dashboard</a></div>`;
    }
    return;
  }
  navigate('#/', { replace: true });
}

export function startRouter() {
  window.addEventListener('hashchange', () => {
    if (skipNext) { skipNext = false; return; }
    if (dirty && !confirm('You have unsaved changes. Leave without saving?')) {
      skipNext = true;
      location.hash = current;
      return;
    }
    resolve();
  });
  window.addEventListener('beforeunload', (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });
  resolve();
}
