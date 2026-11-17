// Subscription & team (cloud mode): trial/plan status, choose a plan and pay,
// cancel, invite staff, sign out.
import { PLANS, TAX_NOTE } from '../plans.js';
import {
  session, addMember, removeMember, signOut, submitPayment, myPayments, paymentDetails,
} from '../cloud/session.js';
import { rupees } from '../pay-details.js';
import { openCheckout } from './checkout.js';
import { accessInfo, limitsOf } from '../cloud/access.js';
import { subscribe, cancelSubscription } from '../cloud/billing.js';
import { razorpayKeyId } from '../cloud/config.js';
import { workspaces } from '../store.js';
import { icon, esc, $, $$, toast, confirmBox } from '../ui.js';
import { setPage } from '../router.js';
import { formatMoney } from '../calc.js';

const money = (n) => formatMoney(n, 'INR').replace('.00', '');
const fmt = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const ms = (t) => (t && t.toMillis ? t.toMillis() : t && t.seconds ? t.seconds * 1000 : t ? Date.parse(t) : 0);

export function subscriptionView(main, params, query) {
  const acc = session.account || {};
  const a = accessInfo(acc);
  const owner = session.role === 'owner';
  const lim = limitsOf(acc);
  let period = query.get('period') || acc.period || 'monthly';
  const wanted = query.get('plan') || '';
  let chosen = PLANS[wanted] ? wanted : (PLANS[acc.plan] ? acc.plan : 'business');
  let payments = [];
  let details = null;
  setPage('Subscription & team', `<button class="btn" id="signOut">${icon('back')} Sign out</button>`);

  const statusLine = {
    trial: `Free trial: <b>${a.daysLeft} day${a.daysLeft === 1 ? '' : 's'} left</b> (ends ${fmt(a.until)})`,
    active: `<b>${esc((PLANS[acc.plan] || {}).name || 'Paid')}</b> plan, ${acc.period === 'yearly' ? 'yearly' : 'monthly'} · ${acc.status === 'cancelled' || acc.cancelAtPeriodEnd ? 'ends' : 'renews'} ${fmt(ms(acc.paidUntil))}`,
    grace: `Payment due. Access continues until ${fmt(a.until)}. Please update your payment.`,
    expired: 'Your trial or plan has ended. Your data is safe and can be viewed, but not changed. Choose a plan to continue.',
  }[a.state];

  const pending = () => payments.find((r) => r.status === 'pending');
  const checkout = (plan) => {
    chosen = plan;
    openCheckout({
      plan, period, details, email: session.user.email,
      onSubmit: async (req) => {
        await submitPayment(req);
        payments = await myPayments().catch(() => payments);
        render();
      },
    });
  };

  const render = () => {
    const stateName = { trial: 'Free trial', active: 'Active', grace: 'Payment due', expired: 'Expired' }[a.state];
    const pct = a.state === 'trial' ? Math.max(4, Math.min(100, Math.round((a.daysLeft / 14) * 100))) : 0;
    const pend = pending();
    main.innerHTML = `
    <section class="sx-hero st-${a.state}">
      <div class="sx-hero-top">
        <div><p class="sx-eyebrow">Your plan</p><h2>${a.state === 'active' ? `${esc((PLANS[acc.plan] || {}).name || 'Paid')} plan` : stateName}</h2></div>
        <span class="sx-chip">${icon(a.state === 'active' ? 'check' : 'clock', 14)} ${stateName}</span>
      </div>
      <p class="sx-line">${statusLine}</p>
      ${a.state === 'trial' ? `<div class="sx-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>` : ''}
      <p class="sx-meta">${esc(session.user.email)} · ${owner ? 'Account owner' : 'Staff member'} · ${(acc.memberEmails || []).length + 1}/${lim.users} users · ${workspaces().length}/${lim.businesses} businesses</p>
      ${owner && acc.subscriptionId && a.state === 'active' && acc.status !== 'cancelled' && !acc.cancelAtPeriodEnd ? `<button class="btn" id="cancelSub">${icon('x')} Cancel subscription</button>` : ''}
    </section>

    ${pend ? `<section class="sx-pending">${icon('clock', 20)}<div><b>Payment being verified</b><span>${rupees(pend.amount)} for ${esc((PLANS[pend.plan] || {}).name || pend.plan)} (${esc(pend.period)}) · ref. ${esc(pend.utr)}. Your plan switches on as soon as it's confirmed.</span></div></section>` : ''}

    ${owner ? `<section class="sx-plans-wrap">
      <div class="sx-plans-head">
        <div><h2>${a.state === 'active' ? 'Change your plan' : 'Choose your plan'}</h2><p class="muted">Simple pricing. Pay by UPI in a minute. Cancel any time.</p></div>
        <div class="co-seg" role="group" aria-label="Billing period"><button type="button" data-period="monthly" class="${period === 'monthly' ? 'on' : ''}">Monthly</button><button type="button" data-period="yearly" class="${period === 'yearly' ? 'on' : ''}">Yearly <em>2 months free</em></button></div>
      </div>
      <div class="sx-plans">${Object.entries(PLANS).map(([k, p]) => {
    const current = a.state === 'active' && acc.plan === k && acc.period === period;
    return `<article class="sx-plan${p.popular ? ' popular' : ''}${wanted === k ? ' wanted' : ''}">
          ${p.popular ? '<span class="sx-ribbon">Most popular</span>' : ''}
          <h3>${esc(p.name)}</h3><p class="sx-for">${esc(p.for)}</p>
          <div class="sx-price"><b>${money(period === 'yearly' ? p.yearly : p.monthly)}</b><span>/${period === 'yearly' ? 'year' : 'month'}</span></div>
          <p class="sx-note">${period === 'yearly' ? `Just ${money(Math.round(p.yearly / 12))}/month, billed yearly` : TAX_NOTE}</p>
          ${current ? `<button class="btn block" disabled>${icon('check')} Current plan</button>` : `<button class="btn ${p.popular ? 'primary' : 'dark'} block sx-cta" data-checkout="${k}">${a.state === 'active' ? 'Switch to' : 'Choose'} ${esc(p.name)} ${icon('arrow', 16)}</button>`}
          ${razorpayKeyId && !current ? `<button class="btn ghost block small" data-plan="${k}">Autopay with card / UPI Autopay</button>` : ''}
          <ul>${p.features.map((f) => `<li>${icon('check', 16)}<span>${esc(f)}</span></li>`).join('')}</ul>
        </article>`;
  }).join('')}</div>
      <p class="sx-trust">${icon('shield', 16)} Pay by GPay, PhonePe, Paytm or any UPI app · Your bills stay safe even if a plan ends</p>
    </section>

    ${payments.length ? `<section class="card"><h3>Payment history</h3>${payments.map((r) => `<div class="req-row"><span>${esc(PLANS[r.plan] ? PLANS[r.plan].name : r.plan)} · ${esc(r.period)} · ${rupees(r.amount)} · ref. ${esc(r.utr)}</span><span class="badge b-${r.status === 'approved' ? 'paid' : r.status === 'rejected' ? 'overdue' : 'partial'}">${{ pending: 'Verifying', approved: 'Paid', rejected: 'Not received' }[r.status] || esc(r.status)}</span></div>`).join('')}</section>` : ''}` : ''}

    <section class="card">
      <h3>Team <small>${lim.users} users on your plan</small></h3>
      <div class="team">
        <div class="team-row"><span><b>${esc(acc.ownerName || acc.ownerEmail || '')}</b><small>${esc(acc.ownerEmail || '')} · Owner</small></span></div>
        ${(acc.memberEmails || []).map((e) => `<div class="team-row"><span><b>${esc(e)}</b><small>Staff</small></span>${owner ? `<button class="icon-btn danger" data-rm="${esc(e)}" aria-label="Remove ${esc(e)}">${icon('trash', 16)}</button>` : ''}</div>`).join('')}
      </div>
      ${owner ? `<form class="row-gap" id="invite"><input name="email" type="email" placeholder="staff@example.com" required><button class="btn primary">${icon('plus')} Add staff</button></form>
      <p class="muted small">Staff sign in at this site with that email (Google, or an email account they confirm). They see and edit the same businesses as you, but can't manage billing or the team.</p>` : ''}
    </section>`;

    $$('[data-period]', main).forEach((b) => b.addEventListener('click', () => { period = b.dataset.period; render(); }));
    $$('[data-checkout]', main).forEach((b) => b.addEventListener('click', () => checkout(b.dataset.checkout)));
    $$('[data-plan]', main).forEach((b) => b.addEventListener('click', async () => {
      const plan = b.dataset.plan;
      b.disabled = true;
      b.textContent = 'Opening payment…';
      try {
        await subscribe(plan, period, session.user);
        toast(`Thank you! ${PLANS[plan].name} plan is active.`);
        setTimeout(() => location.reload(), 1200);
      } catch (e) {
        toast(e.message, 'err');
        render();
      }
    }));
    const cancel = $('#cancelSub', main);
    if (cancel) cancel.addEventListener('click', async () => {
      if (!(await confirmBox('Cancel subscription?', `Your plan stays active until ${fmt(ms(acc.paidUntil))}. After that BillX becomes read-only; your data is kept.`, 'Cancel subscription'))) return;
      try { await cancelSubscription(); toast('Subscription cancelled. Access continues until the end of the period.'); } catch (e) { toast(e.message, 'err'); }
    });
    const inv = $('#invite', main);
    if (inv) inv.addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await addMember(new FormData(inv).get('email')); toast('Staff added'); } catch (ex) { toast(ex.message, 'err'); }
    });
    $$('[data-rm]', main).forEach((b) => b.addEventListener('click', async () => {
      if (await confirmBox('Remove staff?', `${b.dataset.rm} will lose access to your businesses.`, 'Remove')) {
        try { await removeMember(b.dataset.rm); toast('Removed'); } catch (ex) { toast(ex.message, 'err'); }
      }
    }));
  };
  render();
  if (owner) {
    myPayments().then((list) => { payments = list; render(); }).catch(() => {});
    paymentDetails().then((d) => {
      details = d;
      render();
      if (PLANS[wanted] && !document.querySelector('dialog.co')) checkout(wanted);
    });
  }
  $('#signOut').addEventListener('click', () => signOut());
  const rerender = () => { if (location.hash.startsWith('#/subscription')) subscriptionView(main, params, query); };
  window.addEventListener('billx:account', rerender, { once: true });
}
