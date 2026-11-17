// Subscription & team (cloud mode): trial/plan status, choose a plan and pay,
// cancel, invite staff, sign out.
import { PLANS, TAX_NOTE } from '../plans.js';
import {
  session, addMember, removeMember, signOut, submitPayment, myPayments,
} from '../cloud/session.js';
import {
  payDetailsHTML, bindCopy, payAmount, rupees, whatsappLink, confirmationText,
} from '../pay-details.js';
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
      <div class="sub-plans">${Object.entries(PLANS).map(([k, p]) => {
    const current = a.state === 'active' && acc.plan === k && acc.period === period;
    return `<div class="sub-plan${p.popular ? ' popular' : ''}${wanted === k ? ' wanted' : ''}">
          <b>${esc(p.name)}</b><small>${esc(p.for)}</small>
          <div class="sub-price">${money(period === 'yearly' ? p.yearly : p.monthly)}<small>/${period === 'yearly' ? 'year' : 'month'} · ${TAX_NOTE}</small></div>
          <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          ${razorpayKeyId ? `<button class="btn ${p.popular || wanted === k ? 'primary' : ''} block" data-plan="${k}" ${current ? 'disabled' : ''}>${current ? 'Current plan' : `Autopay: ${esc(p.name)}`}</button>` : ''}
          <button class="btn ${chosen === k ? 'primary' : ''} block" data-choose="${k}">${chosen === k ? `${icon('check')} Selected` : `Choose ${esc(p.name)}`}</button>
        </div>`;
  }).join('')}</div>
      ${razorpayKeyId ? '<p class="muted small">Autopay: secure payment by Razorpay (UPI Autopay, cards, net banking). Renews automatically; cancel any time.</p>' : ''}
    </section>

    <section class="card" id="manualPay">
      <h3>Pay by UPI / GPay / bank transfer <small>${esc(PLANS[chosen].name)}, ${period}</small></h3>
      ${payDetailsHTML(chosen, period)}
      <form id="utrForm" class="row-gap wrap">
        <input name="utr" required minlength="6" placeholder="UTR / reference number after you pay" style="flex:1;min-width:220px">
        <select name="method" style="width:auto"><option>UPI</option><option>Bank transfer</option></select>
        <button class="btn primary">${icon('send')} I've paid: submit</button>
      </form>
      <p class="muted small">We check the payment and switch on your plan for ${period === 'yearly' ? '1 year' : '1 month'}, usually within a few hours. For each renewal, pay again the same way.</p>
      ${payments.length ? `<h4>Your payments</h4>${payments.map((r) => `<div class="req-row"><span>${esc(PLANS[r.plan] ? PLANS[r.plan].name : r.plan)} · ${esc(r.period)} · ${rupees(r.amount)} · UTR ${esc(r.utr)}</span><span class="badge b-${r.status === 'approved' ? 'paid' : r.status === 'rejected' ? 'overdue' : 'partial'}">${{ pending: 'Checking', approved: 'Approved', rejected: 'Not found' }[r.status] || esc(r.status)}</span></div>`).join('')}` : ''}
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
    $$('[data-choose]', main).forEach((b) => b.addEventListener('click', () => {
      chosen = b.dataset.choose;
      render();
      $('#manualPay', main).scrollIntoView({ behavior: 'smooth' });
    }));
    const payBox = $('#manualPay', main);
    if (payBox) bindCopy(payBox);
    const utrForm = $('#utrForm', main);
    if (utrForm) utrForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(utrForm);
      const req = { plan: chosen, period, amount: payAmount(chosen, period), utr: fd.get('utr'), method: fd.get('method') };
      try {
        await submitPayment(req);
        toast('Thank you! We will confirm your payment shortly.');
        payments = await myPayments().catch(() => payments);
        render();
        const wa = whatsappLink(confirmationText({ ...req, email: session.user.email }));
        if (wa && confirm('Also send the payment details to BillX on WhatsApp for faster activation?')) window.open(wa, '_blank', 'noopener');
      } catch (ex) { toast(ex.message, 'err'); }
    });
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
  if (owner) myPayments().then((list) => { payments = list; render(); }).catch(() => {});
  $('#signOut').addEventListener('click', () => signOut());
  const rerender = () => { if (location.hash.startsWith('#/subscription')) subscriptionView(main, params, query); };
  window.addEventListener('billx:account', rerender, { once: true });
}
