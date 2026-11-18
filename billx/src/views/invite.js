// "Refer & earn" card: share your invite link; when a shop you invite
// subscribes, you both get one month free.

import { refLink, inviteText } from '../referral.js';
import { icon, esc, copyText, toast } from '../ui.js';

export function inviteCardHTML(accountId, business = '', compact = false) {
  if (!accountId) return '';
  const link = refLink(accountId);
  const wa = `https://wa.me/?text=${encodeURIComponent(inviteText(accountId, business))}`;
  return `<section class="invite${compact ? ' compact' : ''}">
    <div class="invite-ic">${icon('star', 22)}</div>
    <div class="invite-txt"><b>Refer &amp; earn: 1 month free</b>
      <span>Invite another shop owner. When they subscribe, <b>you both get 1 month free</b>. No limit.</span>
      ${compact ? '' : `<code class="invite-link">${esc(link)}</code>`}</div>
    <div class="invite-act">
      <a class="btn whatsapp" href="${esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp', 16)} Invite on WhatsApp</a>
      <button type="button" class="btn" data-copy-invite="${esc(link)}">${icon('copy', 16)} Copy link</button>
    </div>
  </section>`;
}

export function bindInvite(root) {
  if (root.dataset.inviteBound) return;
  root.dataset.inviteBound = '1';
  root.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy-invite]');
    if (b && (await copyText(b.dataset.copyInvite))) toast('Invite link copied');
  });
}
