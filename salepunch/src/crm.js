// CRM integration.
// In:  POST /hooks/leads?key=LEADS_WEBHOOK_KEY  — website forms, Meta lead ads
//      (through Zapier / Make / Pabbly), Zoho, HubSpot or any tool that can
//      send a webhook. Field names are matched loosely.
// Out: after every analysed call SalePunch POSTs a JSON event to the CRM
//      webhook URL saved in Settings, so the outside CRM gets the outcome,
//      summary, score and next follow-up.
import { normalizePhone } from './util.js';
import { LEAD_STATUSES } from './constants.js';

const pick = (o, keys) => {
  for (const k of keys) {
    const hit = Object.keys(o).find((x) => x.toLowerCase().replace(/[\s_-]/g, '') === k);
    if (hit && String(o[hit]).trim()) return String(o[hit]).trim();
  }
  return '';
};

/** Maps any lead-ish JSON object to SalePunch lead fields (or null). */
export function mapIncomingLead(o) {
  if (!o || typeof o !== 'object') return null;
  // Meta lead ads style: field_data: [{name, values: []}]
  if (Array.isArray(o.field_data)) {
    o = { ...o, ...Object.fromEntries(o.field_data.map((f) => [f.name, (f.values || [])[0] || ''])) };
  }
  const first = pick(o, ['firstname']);
  const last = pick(o, ['lastname']);
  const name = pick(o, ['name', 'fullname', 'leadname', 'contactname', 'customername']) || [first, last].filter(Boolean).join(' ');
  const phone = normalizePhone(pick(o, ['phone', 'phonenumber', 'mobile', 'mobilenumber', 'contact', 'contactnumber', 'whatsapp', 'tel']));
  if (!phone) return null;
  const status = pick(o, ['status', 'leadstatus']).toLowerCase().replace(/[\s-]/g, '_');
  return {
    name: name || phone,
    phone,
    email: pick(o, ['email', 'emailaddress']),
    source: pick(o, ['source', 'leadsource', 'utmsource', 'campaign', 'campaignname', 'formname']) || 'webhook',
    notes: pick(o, ['notes', 'message', 'comments', 'requirement', 'remarks']),
    external_id: pick(o, ['id', 'leadid', 'externalid', 'recordid']),
    owner_email: pick(o, ['owner', 'owneremail', 'agent', 'agentemail', 'assignedto']).toLowerCase(),
    status: LEAD_STATUSES.includes(status) ? status : 'new',
  };
}

/** Lead status after an analysed call (never downgrades a won lead). */
export function leadStatusAfterCall(current, outcome) {
  if (current === 'won') return 'won';
  return { converted: 'won', interested: 'interested', follow_up: 'follow_up', not_interested: 'lost' }[outcome] || (current === 'new' ? 'contacted' : current);
}

export function crmEvent({ call, lead, agent, analysis, appUrl }) {
  return {
    event: 'call.analyzed',
    call_id: call.id,
    call_url: appUrl ? `${appUrl}/#/calls/${call.id}` : undefined,
    started_at: new Date(call.started_at).toISOString(),
    duration_sec: call.duration_sec,
    agent: agent ? { name: agent.name, email: agent.email } : null,
    lead: lead ? { id: lead.id, external_id: lead.external_id || null, name: lead.name, phone: lead.phone, status: lead.status } : { phone: call.lead_phone },
    outcome: analysis.outcome,
    conversion_chance: analysis.conversion_chance,
    skill_score: analysis.overall_score,
    summary: analysis.summary,
    next_action: analysis.next_action,
    follow_up_date: analysis.follow_up_date || null,
    objections: analysis.objections.map((o) => o.objection),
    red_flags: analysis.red_flags,
  };
}

export async function postWebhook(url, payload, fetchFn = fetch) {
  if (!url) return;
  const res = await fetchFn(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
}
