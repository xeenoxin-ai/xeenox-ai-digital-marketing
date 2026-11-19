// BookX app shell: navigation, routing and re-rendering.
import './app.css';
import { isSetUp, settings, all } from './store.js';
import { esc, icon, $, $$ } from './ui.js';
import { L, isOrders, today } from './common.js';
import { onChange, openBooking } from './booking.js';
import { todayView, calendarView, remindersView } from './views.js';
import { customersView, customerView } from './people.js';
import { servicesView, staffView, reportsView, settingsView, shareView, importView, setupView } from './manage.js';

const NAV = [
  ['today', '#/', 'Today'],
  ['calendar', '#/calendar', 'Calendar'],
  ['bell', '#/reminders', 'Reminders'],
  ['users', '#/customers', () => L().customers],
  ['list', '#/services', () => (isOrders() ? 'Products' : 'Services')],
  ['team', '#/staff', () => `${L().staff}s`],
  ['chart', '#/reports', 'Reports'],
  ['link', '#/share', 'Booking link'],
  ['settings', '#/settings', 'Settings'],
];
const MOBILE = ['#/', '#/calendar', '#/reminders', '#/customers'];

const routes = [
  ['', () => 'Today', todayView],
  ['calendar', () => 'Calendar', calendarView],
  ['reminders', () => 'Reminders', remindersView],
  ['customers', () => L().customers, customersView],
  ['customer', () => L().customer, (el, r, q, id) => customerView(el, r, id)],
  ['services', () => (isOrders() ? 'Products' : 'Services'), servicesView],
  ['staff', () => `${L().staff}s`, staffView],
  ['reports', () => 'Reports', reportsView],
  ['share', () => 'Booking link', shareView],
  ['settings', () => 'Settings', settingsView],
  ['import', () => 'Booking request', importView],
];

const label = (x) => (typeof x === 'function' ? x() : x);

function shell() {
  const s = settings();
  const nav = NAV.filter(([, href]) => !(href === '#/staff' && isOrders()));
  document.body.innerHTML = `
  <aside class="sidebar" aria-label="Main">
    <a class="brand" href="#/"><img src="./icon.svg" alt="" width="30" height="30"><span>Book<b>X</b></span></a>
    <div class="biz"><b>${esc(s.business.name || 'Your business')}</b><small>${esc(s.labels.booking)}s · ${esc(s.labels.customers)}</small></div>
    <nav class="nav">${nav.map(([ic, href, name]) => `<a href="${href}">${icon(ic)}<span>${esc(label(name))}</span>${href === '#/reminders' ? '<em id="remCount" hidden></em>' : ''}</a>`).join('')}</nav>
    <button class="btn primary block" id="sideNew">${icon('plus', 16)} New ${esc(L().booking.toLowerCase())}</button>
    <p class="side-note">Data stays in this browser. Back it up from Settings.</p>
  </aside>
  <div class="scrim" id="scrim"></div>
  <div class="shell">
    <header class="topbar"><button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">${icon('menu')}</button><h1 id="pageTitle">BookX</h1><button class="btn primary small top-new" id="topNew" aria-label="New booking">${icon('plus', 16)}</button></header>
    <main id="view" tabindex="-1"></main>
  </div>
  <nav class="tabbar" aria-label="Quick">${NAV.filter(([, h]) => MOBILE.includes(h)).map(([ic, href, name]) => `<a href="${href}">${icon(ic, 20)}<span>${esc(label(name))}</span></a>`).join('')}<a href="#" id="tabMore">${icon('more', 20)}<span>More</span></a></nav>`;
  $('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
  $('#tabMore').onclick = (e) => { e.preventDefault(); document.body.classList.toggle('nav-open'); };
  $('#scrim').onclick = () => document.body.classList.remove('nav-open');
  $('#sideNew').onclick = () => { document.body.classList.remove('nav-open'); openBooking({ date: currentDate() }); };
  $('#topNew').onclick = () => openBooking({ date: currentDate() });
}

const currentDate = () => (location.hash.startsWith('#/calendar') && new URLSearchParams(location.hash.split('?')[1] || '').get('d')) || today();

let lastPath = null;
async function render(rebuild = false) {
  if (!isSetUp()) {
    document.body.innerHTML = '<main id="view" class="solo"></main>';
    lastPath = null;
    setupView($('#view'), () => { location.hash = '#/'; render(true); });
    return;
  }
  if (rebuild || !$('.sidebar')) shell();
  const [path, qs] = (location.hash.slice(1) || '/').split('?');
  const [name = '', id = ''] = path.split('/').filter(Boolean);
  const q = new URLSearchParams(qs || '');
  const r = routes.find(([n]) => n === name) || routes[0];
  $('#pageTitle').textContent = label(r[1]);
  document.title = `${label(r[1])} · BookX`;
  $$('.nav a, .tabbar a').forEach((a) => {
    const base = a.getAttribute('href').slice(2).split('?')[0];
    a.classList.toggle('on', base === name || (base === 'customers' && name === 'customer'));
  });
  document.body.classList.remove('nav-open');
  // Fresh element per render so listeners never pile up.
  const main = $('#view');
  const keepScroll = lastPath === path ? scrollY : 0;
  const el = document.createElement('div');
  el.className = `view v-${name || 'today'}`;
  main.replaceChildren(el);
  await r[2](el, (full) => (full === true ? render(true) : render()), q, id);
  if (keepScroll) scrollTo(0, keepScroll);
  else if (lastPath !== path) scrollTo(0, 0);
  lastPath = path;
  badge();
}

function badge() {
  const el = $('#remCount');
  if (!el) return;
  // Cheap count: unsent booking reminders for tomorrow.
  const t = today();
  const tomorrow = all('appts').filter((a) => ['booked', 'confirmed'].includes(a.status) && a.date > t && a.date <= nextDay(t) && !a.remindedOn).length;
  el.hidden = !tomorrow;
  el.textContent = tomorrow;
}
const nextDay = (d) => { const x = new Date(`${d}T12:00:00`); x.setDate(x.getDate() + 1); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };

onChange(() => render());
addEventListener('hashchange', () => {
  // A new page closes any open pop-up.
  document.querySelectorAll('.modal-wrap').forEach((m) => m.remove());
  document.body.classList.remove('has-modal');
  render();
});
// Coming back from WhatsApp: refresh "sent" marks and the clock.
document.addEventListener('visibilitychange', () => { if (!document.hidden && !document.querySelector('.modal-wrap')) render(); });
render(true);
