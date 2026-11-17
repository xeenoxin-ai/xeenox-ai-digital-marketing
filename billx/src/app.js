// App entry. Free mode: everything in this browser. Cloud mode (when
// billx/src/cloud/config.js has a Firebase config): login, sync, trial, plans.
import './app.css';
import './invoice.css';
import {
  load, settings, onChange, onRemote, workspaces, workspaceInfo, switchWorkspace, createWorkspace, hooks,
} from './store.js';
import { INDUSTRIES } from './industries.js';
import { route, startRouter, resolve } from './router.js';
import { icon, toast, modal, esc } from './ui.js';
import { cloudEnabled } from './cloud/config.js';
import { dashboardView } from './views/dashboard.js';
import { listView, editorView, docView } from './views/documents.js';
import { listView as clientsView, detailView as clientView } from './views/clients.js';
import { itemsView } from './views/items.js';
import { designView } from './views/design.js';
import { reportsView } from './views/reports.js';
import { settingsView } from './views/settings.js';

let cloud = null; // { session, access } in cloud mode

// Guest = try BillX without an account (data stays in this browser), even on the paid site.
const GUEST_KEY = 'billx-guest';
const storeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const storeSet = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* ignore */ } };
if (new URLSearchParams(location.search).get('guest') === '1') storeSet(GUEST_KEY, '1');
const guest = cloudEnabled() && storeGet(GUEST_KEY) === '1';
const leaveGuest = () => { storeSet(GUEST_KEY, null); location.hash = '#/signup'; location.reload(); };

document.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = icon(el.dataset.ic, 20); });

function updateShell() {
  const s = settings();
  const navClients = document.querySelector('[data-nav-clients]');
  if (navClients) navClients.textContent = `${s.clientLabel || 'Client'}s`;
  document.getElementById('wsName').textContent = s.business.name;
  document.getElementById('wsSector').textContent = (INDUSTRIES[s.industry] || INDUSTRIES.general).name;
}

function businessLimit() {
  if (!cloud) return Infinity;
  return cloud.access.limitsOf(cloud.session.account).businesses;
}

function openSwitcher() {
  const list = workspaces();
  const m = modal({
    title: 'Your businesses', submit: '', cancel: 'Close',
    body: `<p class="muted">Run every business from one BillX. Each has its own customers, items, numbering, design and reports.</p>
      <div class="ws-list">${list.map((w) => {
    const info = workspaceInfo(w.id);
    return `<button type="button" class="ws-item${w.active ? ' on' : ''}" data-ws="${w.id}"><b>${esc(info.name || 'New business')}</b>
        <small>${esc((INDUSTRIES[info.industry] || {}).name || 'Not set up yet')}${w.active ? ' · open now' : ''}</small></button>`;
  }).join('')}</div>
      <button type="button" class="btn primary block" id="wsAdd">${icon('plus')} Add another business</button>
      ${Number.isFinite(businessLimit()) ? `<p class="muted small">${list.length} of ${businessLimit()} businesses on your plan.</p>` : ''}`,
  });
  m.el.addEventListener('click', (e) => {
    const item = e.target.closest('[data-ws]');
    if (item && !item.classList.contains('on')) {
      switchWorkspace(item.dataset.ws);
      location.hash = '#/';
      location.reload();
    }
    if (e.target.closest('#wsAdd')) {
      if (list.length >= businessLimit()) {
        toast(`Your plan allows ${businessLimit()} businesses. Upgrade for more.`, 'err');
        return;
      }
      if (createWorkspace() === null) return;
      location.hash = '#/';
      location.reload();
    }
  });
}

/** Editing pages need an active trial or plan. */
const writable = (view) => (main, params, query) => {
  if (!hooks.canWrite()) {
    toast('Your trial or plan has ended. Choose a plan to make changes; your data is safe.', 'err');
    location.hash = '#/subscription';
    return;
  }
  view(main, params, query);
};

function registerRoutes() {
  route('/', dashboardView);
  route('/docs/:type?', listView);
  route('/new/:type', writable(editorView));
  route('/edit/:id', writable(editorView));
  route('/doc/:id', docView);
  route('/clients', clientsView);
  route('/client/:id', clientView);
  route('/items', itemsView);
  route('/design', designView);
  route('/reports', reportsView);
  route('/settings', settingsView);
  if (cloud) {
    route('/subscription', (main, p, q) => import('./views/subscription.js').then((m) => m.subscriptionView(main, p, q)));
  }
  route('/signup', () => { if (guest) leaveGuest(); else location.hash = '#/'; });
  route('/login', () => { location.hash = '#/'; });
}

function updateBanner() {
  const el = document.getElementById('acctBanner');
  if (guest) {
    el.className = 'acct-banner';
    el.innerHTML = 'You are using BillX free on this device, without an account. <button class="btn" id="bannerSignup">Create free account</button> <span class="muted small">to save in the cloud, add staff and use it on every device.</span>';
    el.hidden = false;
    document.getElementById('bannerSignup').onclick = leaveGuest;
    return;
  }
  if (!cloud) { el.hidden = true; return; }
  const { session, access } = cloud;
  if (session.error === 'permission') {
    el.className = 'acct-banner bad';
    el.innerHTML = 'You no longer have access to this account. <button class="btn" id="bannerOut">Sign out</button>';
    el.hidden = false;
    document.getElementById('bannerOut').onclick = () => import('./cloud/session.js').then((m) => m.signOut());
    return;
  }
  const a = access.accessInfo(session.account);
  const owner = session.role === 'owner';
  const cta = owner ? '<a class="btn" href="#/subscription">Choose a plan</a>' : '<span>Ask the account owner to renew.</span>';
  const text = {
    trial: a.daysLeft <= 14 ? `Free trial: <b>${a.daysLeft} day${a.daysLeft === 1 ? '' : 's'} left</b>. ${cta}` : '',
    grace: `Payment due. Access continues for ${a.daysLeft} day${a.daysLeft === 1 ? '' : 's'}. ${owner ? '<a class="btn" href="#/subscription">Update payment</a>' : ''}`,
    expired: `Your ${session.account && session.account.paidUntil ? 'plan' : 'free trial'} has ended. Your bills are safe and you can view them; choose a plan to continue. ${cta}`,
    active: '',
  }[a.state];
  el.className = `acct-banner ${a.state === 'expired' ? 'bad' : a.state === 'grace' ? 'warn' : ''}`;
  el.innerHTML = text;
  el.hidden = !text;
}

function boot() {
  document.body.classList.remove('onboarding');
  window.onhashchange = null;
  updateShell();
  onChange(updateShell);
  document.getElementById('wsBtn').addEventListener('click', openSwitcher);
  document.getElementById('menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  document.getElementById('scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
  window.addEventListener('billing:save-failed', () => toast('Browser storage is full. Download a backup and remove large images.', 'err'));
  window.addEventListener('billx:readonly', () => toast('Read-only: your trial or plan has ended. Choose a plan to make changes.', 'err'));
  // Changes from staff on other devices: refresh the page you're on unless you're typing in it.
  onRemote(() => {
    updateShell();
    if (!/^#\/(new|edit|settings|design)/.test(location.hash) && !document.querySelector('dialog[open]')) resolve();
  });
  registerRoutes();
  updateBanner();
  if (cloud) {
    document.getElementById('navSub').hidden = false;
    document.getElementById('sideNote').textContent = `Signed in as ${cloud.session.user.email}. Saved to the cloud.`;
    updateBanner();
    window.addEventListener('billx:account', () => { updateBanner(); });
  }
  startRouter();
}

async function main() {
  if (!cloudEnabled() || guest) {
    load();
    boot();
    return;
  }
  const [sessionMod, authView, access] = await Promise.all([
    import('./cloud/session.js'), import('./cloud/auth-view.js'), import('./cloud/access.js'),
  ]);
  authView.showStatus('Loading…');
  const wanted = location.hash.match(/^#\/signup\?(.*plan=.*)$/);
  if (wanted) sessionStorage.setItem('billx-wanted', wanted[1]);
  sessionMod.startCloud({
    onSignedOut: () => authView.showAuth(),
    onVerify: (user) => authView.showVerify(user),
    onStatus: (t) => authView.showStatus(t),
    onReady: (session, err) => {
      if (err) {
        authView.showStatus(`Could not open your account (${err.code || err.message}). Check your connection and reload.`);
        return;
      }
      cloud = { session, access };
      if (/^#\/(signup|login)/.test(location.hash)) {
        const w = sessionStorage.getItem('billx-wanted');
        location.hash = w && settings().onboarded && session.role === 'owner' ? `#/subscription?${w}` : '#/';
      }
      boot();
    },
  });
}

main();
