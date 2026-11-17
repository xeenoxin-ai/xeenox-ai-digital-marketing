// Admin console for the BillX owner: every customer account, trial and
// payment status, revenue, and manual activation (cash / bank transfer).
// Only users listed in the Firestore "admins" collection can open it.
import './app.css';
import { cloudEnabled } from './cloud/config.js';
import { PLANS, daysOf } from './plans.js';
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
  const {
    doc, getDoc, getDocs, collection, updateDoc, setDoc, Timestamp, serverTimestamp,
  } = fsMod;

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
    let pending = [];
    const load = async () => {
      const [snap, reqs] = await Promise.all([getDocs(collection(db, 'accounts')), getDocs(collection(db, 'paymentRequests'))]);
      pending = reqs.docs.map((d) => ({ id: d.id, ...d.data() })).filter((r) => r.status === 'pending')
        .sort((x, y) => ms(x.createdAt) - ms(y.createdAt));
      const rows = snap.docs.map((d) => {
        const a = { id: d.id, ...d.data() };
        return { a, info: accessInfo(a) };
      }).sort((x, y) => ms(y.a.createdAt) - ms(x.a.createdAt));
      render(rows);
    };

    /** Your UPI / bank details: stored in Firestore, shown only to signed-in customers. */
    async function editPaymentDetails() {
      const snap = await getDoc(doc(db, 'private', 'payment')).catch(() => null);
      const d = (snap && snap.exists() && snap.data()) || {};
      const f = (name, label, ph = '') => field(label, `<input name="${name}" value="${esc(d[name] || '')}" placeholder="${esc(ph)}">`);
      modal({
        title: 'Payment details (private)',
        body: `<p class="muted">Shown only to signed-in BillX customers on their Subscription page. Never stored in the website code.</p>
          <div class="grid g2">
            ${f('payee', 'Pay to name', 'BillX Solutions')}
            ${f('gpay', 'GPay / UPI number')}
            ${f('upiId', 'UPI ID (for the QR code)', 'name@okaxis')}
            ${f('accountName', 'Account holder name')}
            ${f('accountNo', 'Account number')}
            ${f('ifsc', 'IFSC', 'SBIN0014966')}
            ${f('bankName', 'Bank', 'State Bank of India')}
            ${f('branch', 'Branch')}
          </div>`,
        submit: 'Save',
        onSubmit: async (fd) => {
          const data = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v).trim()]));
          data.ifsc = (data.ifsc || '').toUpperCase();
          try {
            await setDoc(doc(db, 'private', 'payment'), { ...data, updatedAt: serverTimestamp() });
            toast('Payment details saved');
          } catch (e) { toast(e.message, 'err'); return false; }
          return true;
        },
      });
    }

    /** Approve a UPI / bank payment: extend the plan from today or from the current end date. */
    async function approve(r, rows) {
      const acc = (rows.find((x) => x.a.id === r.accountId) || {}).a;
      if (!acc) return toast('Account not found', 'err');
      const from = Math.max(Date.now(), ms(acc.paidUntil) || 0);
      const until = new Date(from + daysOf(r.period) * 86400000);
      await updateDoc(doc(db, 'accounts', r.accountId), {
        status: 'active', plan: r.plan, period: r.period, paidUntil: Timestamp.fromDate(until), manual: true,
        maxUsers: PLANS[r.plan].users, maxBusinesses: PLANS[r.plan].businesses,
      });
      await updateDoc(doc(db, 'paymentRequests', r.id), { status: 'approved', reviewedAt: serverTimestamp() });
      toast(`Approved: ${PLANS[r.plan].name} until ${day(until.getTime())}`);
      load();
    }

    function pendingHTML() {
      if (!pending.length) return '';
      return `<section class="card"><h3>Payments to confirm (${pending.length}) <small>check your bank / GPay for these, then approve</small></h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>Customer</th><th>Plan</th><th class="num">Amount</th><th>UTR / reference</th><th>Submitted</th><th></th></tr></thead>
        <tbody>${pending.map((r) => `<tr><td>${esc(r.email)}</td><td>${esc(PLANS[r.plan] ? PLANS[r.plan].name : r.plan)}<div class="sub">${esc(r.period)} · ${esc(r.method)}</div></td>
          <td class="num">${money(r.amount)}</td><td><b>${esc(r.utr)}</b></td><td>${day(ms(r.createdAt))}</td>
          <td><button class="btn primary" data-approve="${r.id}">${icon('check')} Approve</button> <button class="btn danger-text" data-reject="${r.id}">Not received</button></td></tr>`).join('')}</tbody></table></div></section>`;
    }

    function render(rows, q = '') {
      const paying = rows.filter((r) => r.info.state === 'active' && r.a.plan && r.a.status !== 'cancelled');
      const mrr = paying.reduce((s, r) => s + (r.a.period === 'yearly' ? PLANS[r.a.plan].yearly / 12 : PLANS[r.a.plan].monthly), 0);
      const shown = rows.filter((r) => !q || `${r.a.ownerEmail} ${r.a.ownerName} ${r.a.plan} ${r.info.state}`.toLowerCase().includes(q));
      view.innerHTML = `
        <div class="kpis">
          <div class="kpi"><span>Accounts</span><b>${rows.length}</b></div>
          <div class="kpi"><span>In free trial</span><b>${rows.filter((r) => r.info.state === 'trial').length}</b></div>
          <div class="kpi good"><span>Paying</span><b>${paying.length}</b></div>
          <div class="kpi good"><span>Monthly revenue (MRR)</span><b>${money(mrr)}</b><small>monthly equivalent</small></div>
          <div class="kpi warn"><span>Payment due</span><b>${rows.filter((r) => r.info.state === 'grace').length}</b></div>
          <div class="kpi bad"><span>Expired</span><b>${rows.filter((r) => r.info.state === 'expired').length}</b></div>
        </div>
        ${pendingHTML()}
        <div class="toolbar"><div class="search">${icon('search', 16)}<input id="q" type="search" placeholder="Search email, plan, status" value="${esc(q)}"></div>
          <button class="btn" id="payDetails">${icon('cash')} Payment details (private)</button><button class="btn" id="csv">${icon('download')} Export CSV</button><button class="btn" id="reload">${icon('refresh')} Refresh</button></div>
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
      document.getElementById('payDetails').onclick = editPaymentDetails;
      document.getElementById('csv').onclick = () => download(`billx-accounts-${new Date().toISOString().slice(0, 10)}.csv`, toCSV([
        ['Owner', 'Email', 'Signed up', 'Plan', 'Period', 'Status', 'State', 'Access until', 'Staff', 'Subscription'],
        ...rows.map(({ a, info }) => [a.ownerName, a.ownerEmail, day(ms(a.createdAt)), a.plan, a.period, a.status, info.state, day(info.until), (a.memberEmails || []).length, a.subscriptionId]),
      ]), 'text/csv');
      view.querySelectorAll('[data-approve]').forEach((b) => b.onclick = async () => {
        b.disabled = true;
        try { await approve(pending.find((r) => r.id === b.dataset.approve), rows); } catch (e) { toast(e.message, 'err'); b.disabled = false; }
      });
      view.querySelectorAll('[data-reject]').forEach((b) => b.onclick = async () => {
        if (!confirm('Mark this payment as not received?')) return;
        try { await updateDoc(doc(db, 'paymentRequests', b.dataset.reject), { status: 'rejected', reviewedAt: serverTimestamp() }); load(); } catch (e) { toast(e.message, 'err'); }
      });
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
