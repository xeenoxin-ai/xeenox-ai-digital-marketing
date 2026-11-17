// Subscription & team (cloud mode): trial/plan status, choose a plan and pay,
// cancel, invite staff, sign out.
import { PLANS } from '../plans.js';
import { session, addMember, removeMember, signOut } from '../cloud/session.js';
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
  setPage('Subscription & team', `<button class="btn" id="signOut">${icon('back')} Sign out</button>`);

  const statusLine = {
    trial: `Free trial: <b>${a.daysLeft} day${a.daysLeft === 1 ? '' : 's'} left</b> (ends ${fmt(a.until)})`,
    active: `<b>${esc((PLANS[acc.plan] || {}).name || 'Paid')}</b> plan, ${acc.period === 'yearly' ? 'yearly' : 'monthly'} · ${acc.status === 'cancelled' || acc.cancelAtPeriodEnd ? 'ends' : 'renews'} ${fmt(ms(acc.paidUntil))}`,
    grace: `Payment due. Access continues until ${fmt(a.until)}. Please update your payment.`,
    expired: 'Your trial or plan has ended. Your data is safe and can be viewed, but not changed. Choose a plan to continue.',
  }[a.state];

  const render = () => {
    main.innerHTML = `
    <section class="card sub-status st-${a.state}">
      <div class="row-between"><h3>Your plan</h3><span class="badge b-${a.state === 'expired' ? 'overdue' : a.state === 'grace' ? 'partial' : a.state === 'trial' ? 'sent' : 'paid'}">${{ trial: 'Trial', active: 'Active', grace: 'Payment due', expired: 'Expired' }[a.state]}</span></div>
      <p>${statusLine}</p>
      <p class="muted small">Signed in as ${esc(session.user.email)} · ${owner ? 'Account owner' : 'Staff member'} · Users ${(acc.memberEmails || []).length + 1}/${lim.users} · Businesses ${workspaces().length}/${lim.businesses}</p>
      ${owner && acc.subscriptionId && a.state === 'active' && acc.status !== 'cancelled' && !acc.cancelAtPeriodEnd ? `<button class="btn danger-text" id="cancelSub">${icon('x')} Cancel subscription</button>` : ''}
    </section>

    ${owner ? `<section class="card">
      <div class="row-between"><h3>${a.state === 'active' ? 'Change plan' : 'Choose a plan'}</h3>
        <div class="l-toggle small" role="group" aria-label="Billing period"><button type="button" data-period="monthly" class="${period === 'monthly' ? 'on' : ''}">Monthly</button><button type="button" data-period="yearly" class="${period === 'yearly' ? 'on' : ''}">Yearly · 2 months free</button></div></div>
      ${razorpayKeyId ? '' : '<p class="muted small">Online payment is being set up. To subscribe now, contact us and we will activate your plan.</p>'}
      <div class="sub-plans">${Object.entries(PLANS).map(([k, p]) => {
    const current = a.state === 'active' && acc.plan === k && acc.period === period;
    return `<div class="sub-plan${p.popular ? ' popular' : ''}${wanted === k ? ' wanted' : ''}">
          <b>${esc(p.name)}</b><small>${esc(p.for)}</small>
          <div class="sub-price">${money(period === 'yearly' ? p.yearly : p.monthly)}<small>/${period === 'yearly' ? 'year' : 'month'} + GST</small></div>
          <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          <button class="btn ${p.popular || wanted === k ? 'primary' : ''} block" data-plan="${k}" ${current || !razorpayKeyId ? 'disabled' : ''}>${current ? 'Current plan' : a.state === 'active' ? `Switch to ${esc(p.name)}` : `Subscribe to ${esc(p.name)}`}</button>
        </div>`;
  }).join('')}</div>
      <p class="muted small">Secure payment by Razorpay: UPI Autopay, cards, net banking. Renews automatically; cancel any time. Switching plans starts the new plan today.</p>
    </section>` : ''}

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
  $('#signOut').addEventListener('click', () => signOut());
  const rerender = () => { if (location.hash.startsWith('#/subscription')) subscriptionView(main, params, query); };
  window.addEventListener('billx:account', rerender, { once: true });
}
