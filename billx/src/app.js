// App entry: routes and shell wiring.
import './app.css';
import './invoice.css';
import {
  load, settings, onChange, workspaces, workspaceInfo, switchWorkspace, createWorkspace,
} from './store.js';
import { INDUSTRIES } from './industries.js';
import { route, startRouter } from './router.js';
import { icon, toast, modal, esc } from './ui.js';
import { dashboardView } from './views/dashboard.js';
import { listView, editorView, docView } from './views/documents.js';
import { listView as clientsView, detailView as clientView } from './views/clients.js';
import { itemsView } from './views/items.js';
import { designView } from './views/design.js';
import { reportsView } from './views/reports.js';
import { settingsView } from './views/settings.js';

load();

document.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = icon(el.dataset.ic, 20); });
function updateShell() {
  const s = settings();
  const navClients = document.querySelector('[data-nav-clients]');
  if (navClients) navClients.textContent = `${s.clientLabel || 'Client'}s`;
  document.getElementById('wsName').textContent = s.business.name;
  document.getElementById('wsSector').textContent = (INDUSTRIES[s.industry] || INDUSTRIES.general).name;
}
updateShell();
onChange(updateShell);

document.getElementById('wsBtn').addEventListener('click', () => {
  const list = workspaces();
  const m = modal({
    title: 'Your businesses', submit: '', cancel: 'Close',
    body: `<p class="muted">Run every business from one BillX. Each has its own ${esc('customers')}, items, numbering, design and reports.</p>
      <div class="ws-list">${list.map((w) => {
    const info = workspaceInfo(w.id);
    return `<button type="button" class="ws-item${w.active ? ' on' : ''}" data-ws="${w.id}"><b>${esc(info.name || 'New business')}</b>
        <small>${esc((INDUSTRIES[info.industry] || {}).name || 'Not set up yet')}${w.active ? ' · open now' : ''}</small></button>`;
  }).join('')}</div>
      <button type="button" class="btn primary block" id="wsAdd">${icon('plus')} Add another business</button>`,
  });
  m.el.addEventListener('click', (e) => {
    const item = e.target.closest('[data-ws]');
    if (item && !item.classList.contains('on')) {
      switchWorkspace(item.dataset.ws);
      location.hash = '#/';
      location.reload();
    }
    if (e.target.closest('#wsAdd')) {
      createWorkspace();
      location.hash = '#/';
      location.reload();
    }
  });
});

document.getElementById('menuBtn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
document.getElementById('scrim').addEventListener('click', () => document.body.classList.remove('nav-open'));
window.addEventListener('billing:save-failed', () => toast('Browser storage is full. Download a backup and remove large images.', 'err'));

route('/', dashboardView);
route('/docs/:type?', listView);
route('/new/:type', editorView);
route('/edit/:id', editorView);
route('/doc/:id', docView);
route('/clients', clientsView);
route('/client/:id', clientView);
route('/items', itemsView);
route('/design', designView);
route('/reports', reportsView);
route('/settings', settingsView);
startRouter();
