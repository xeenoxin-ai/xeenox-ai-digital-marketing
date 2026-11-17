// App entry: routes and shell wiring.
import './app.css';
import './invoice.css';
import { load, settings } from './store.js';
import { route, startRouter } from './router.js';
import { icon, toast } from './ui.js';
import { dashboardView } from './views/dashboard.js';
import { listView, editorView, docView } from './views/documents.js';
import { listView as clientsView, detailView as clientView } from './views/clients.js';
import { itemsView } from './views/items.js';
import { designView } from './views/design.js';
import { reportsView } from './views/reports.js';
import { settingsView } from './views/settings.js';

load();

document.querySelectorAll('[data-ic]').forEach((el) => { el.innerHTML = icon(el.dataset.ic, 20); });
const label = settings().clientLabel || 'Client';
const navClients = document.querySelector('[data-nav-clients]');
if (navClients) navClients.textContent = `${label}s`;

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
