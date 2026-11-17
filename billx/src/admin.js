// Admin console for the BillX owner: every customer account, trial and
// payment status, revenue, and manual activation (cash / bank transfer).
// Only users listed in the Firestore "admins" collection can open it.
import './app.css';
import { cloudEnabled } from './cloud/config.js';
import { PLANS } from './plans.js';
import { esc, icon, toast, modal, field, options, download } from './ui.js';
import { formatMoney } from './calc.js';
import { toCSV } from './helpers.js';

const view = document.getElementById('view');
const money = (n) => formatMoney(n, 'INR').replace('.00', '');
const ms = (t) => (t && t.toMillis ? t.toMillis() : t && t.seconds ? t.seconds * 1000 : t ? Date.parse(t) : 0);
const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

async function main() {
  if (!cloudEnabled()) {
    view.innerHTML = '<div class="empty"><h2>Cloud mode is not set up</h2><p>Add your Firebase config (see docs/BILLX_LAUNCH.md), then open this page again.</p></div>';
    return;
  }
  const [{ firebase }, authMod, fsMod, { accessInfo }, authView] = await Promise.all([
    import('./cloud/firebase.js'), import('firebase/auth'), import('firebase/firestore'), import('./cloud/access.js'), import('./cloud/auth-view.js'),
  ]);
  const { auth, db } = firebase();
  const { doc, getDoc, getDocs, collection, updateDoc, Timestamp } = fsMod;

  authMod.onAuthStateChanged(auth, async (user) => {
    if (!user) { authView.showAuth('login'); return; }
    document.body.classList.remove('onboarding');
    const isAdmin = (await getDoc(doc(db, 'admins', user.uid)).catch(() => null))?.exists();
    document.getElementById('pageActions').innerHTML = `<span class="muted small">${esc(user.email)}</span><button class="btn" id="out">Sign out</button>`;
    document.getElementById('out').onclick = () => authMod.signOut(auth);
    if (!isAdmin) {
      view.innerHTML = `<div class="empty"><h2>Not an admin</h2><p>Add this user ID as a document in the <b>admins</b> collection in Firestore:</p><pre>${esc(user.uid)}</pre></div>`;
      return;
    }
    const load = async () => {
      const snap = await getDocs(collection(db, 'accounts'));
      const rows = snap.docs.map((d) => {
        const a = { id: d.id, ...d.data() };
        return { a, info: accessInfo(a) };
      }).sort((x, y) => ms(y.a.createdAt) - ms(x.a.createdAt));
      render(rows);
    };

    function render(rows, q = '') {
      const paying = rows.filter((r) => r.info.state === 'active' && r.a.plan && r.a.status !== 'cancelled');
      const mrr = paying.reduce((s, r) => s + (r.a.period === 'yearly' ? PLANS[r.a.plan].yearly / 12 : PLANS[r.a.plan].monthly), 0);
      const shown = rows.filter((r) => !q || `${r.a.ownerEmail} ${r.a.ownerName} ${r.a.plan} ${r.info.state}`.toLowerCase().includes(q));
      view.innerHTML = `
        <div class="kpis">
          <div class="kpi"><span>Accounts</span><b>${rows.length}</b></div>
          <div class="kpi"><span>In free trial</span><b>${rows.filter((r) => r.info.state === 'trial').length}</b></div>
          <div class="kpi good"><span>Paying</span><b>${paying.length}</b></div>
          <div class="kpi good"><span>Monthly revenue (MRR)</span><b>${money(mrr)}</b><small>before GST</small></div>
          <div class="kpi warn"><span>Payment due</span><b>${rows.filter((r) => r.info.state === 'grace').length}</b></div>
          <div class="kpi bad"><span>Expired</span><b>${rows.filter((r) => r.info.state === 'expired').length}</b></div>
        </div>
        <div class="toolbar"><div class="search">${icon('search', 16)}<input id="q" type="search" placeholder="Search email, plan, status" value="${esc(q)}"></div>
          <button class="btn" id="csv">${icon('download')} Export CSV</button><button class="btn" id="reload">${icon('refresh')} Refresh</button></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Owner</th><th>Signed up</th><th>Plan</th><th>Status</th><th>Access until</th><th class="num">Staff</th><th></th></tr></thead>
        <tbody>${shown.map(({ a, info }) => `<tr>
          <td><b>${esc(a.ownerName || '—')}</b><div class="sub">${esc(a.ownerEmail)}</div></td>
          <td>${day(ms(a.createdAt))}</td>
          <td>${a.plan ? `${esc(PLANS[a.plan] ? PLANS[a.plan].name : a.plan)}<div class="sub">${esc(a.period || '')}${a.manual ? ' · manual' : ''}</div>` : '—'}</td>
          <td><span class="badge b-${{ trial: 'sent', active: 'paid', grace: 'partial', expired: 'overdue' }[info.state]}">${info.state}</span><div class="sub">${esc(a.status)}</div></td>
          <td>${day(info.until)}</td>
          <td class="num">${(a.memberEmails || []).length}</td>
          <td><button class="btn" data-act="${a.id}">Activate / extend</button></td></tr>`).join('')}</tbody></table></div>`;
      const qEl = document.getElementById('q');
      qEl.oninput = () => { render(rows, qEl.value.toLowerCase()); const n = document.getElementById('q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
      document.getElementById('reload').onclick = load;
      document.getElementById('csv').onclick = () => download(`billx-accounts-${new Date().toISOString().slice(0, 10)}.csv`, toCSV([
        ['Owner', 'Email', 'Signed up', 'Plan', 'Period', 'Status', 'State', 'Access until', 'Staff', 'Subscription'],
        ...rows.map(({ a, info }) => [a.ownerName, a.ownerEmail, day(ms(a.createdAt)), a.plan, a.period, a.status, info.state, day(info.until), (a.memberEmails || []).length, a.subscriptionId]),
      ]), 'text/csv');
      view.querySelectorAll('[data-act]').forEach((b) => b.onclick = () => activate(rows.find((r) => r.a.id === b.dataset.act).a));
    }

    function activate(a) {
      const until = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      modal({
        title: `Activate ${a.ownerEmail}`,
        body: `<p class="muted">For customers who pay by cash, cheque or bank transfer, or to give free days. Payments through Razorpay update automatically.</p>
          <div class="grid g3">
            ${field('Plan', `<select name="plan">${options(Object.entries(PLANS).map(([k, p]) => [k, p.name]), a.plan || 'business')}</select>`)}
            ${field('Period', `<select name="period">${options([['monthly', 'Monthly'], ['yearly', 'Yearly']], a.period || 'monthly')}</select>`)}
            ${field('Access until', `<input type="date" name="until" value="${until}" required>`)}
          </div>`,
        submit: 'Activate',
        onSubmit: async (fd) => {
          const plan = fd.get('plan');
          try {
            await updateDoc(doc(db, 'accounts', a.id), {
              status: 'active', plan, period: fd.get('period'), manual: true,
              paidUntil: Timestamp.fromDate(new Date(`${fd.get('until')}T23:59:59+05:30`)),
              maxUsers: PLANS[plan].users, maxBusinesses: PLANS[plan].businesses,
            });
            toast('Account activated');
            load();
          } catch (e) { toast(e.message, 'err'); return false; }
          return true;
        },
      });
    }
    view.innerHTML = '<div class="empty"><div class="spinner"></div></div>';
    load().catch((e) => { view.innerHTML = `<div class="empty"><p>${esc(e.message)}</p></div>`; });
  });
}

main();
