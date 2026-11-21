// "Where are we losing sales?" and "How productive was each agent?".
// Pure functions over leads, calls and users, so they are tested directly.
import { SKILLS, SKILL_LABELS } from './constants.js';
import { safeJson } from './util.js';
import { isConnected } from './stats.js';

const HOUR = 3600000;
const DAY = 24 * HOUR;
const OPEN = (l) => l.status !== 'won' && l.status !== 'lost';
const A = (c) => (c.analysis && typeof c.analysis === 'object' ? c.analysis : safeJson(c.analysis, null));
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const ref = (l, extra = {}) => ({ id: l.id, name: l.name, phone: l.phone, owner_id: l.owner_id, ...extra });

/**
 * leads: rows (id, name, phone, status, owner_id, source, created_at, next_follow_up)
 * calls: rows (id, lead_id, agent_id, status, outcome, started_at, duration_sec, processing, skill_score, analysis)
 * Returns the funnel, the ranked list of leaks, lost reasons, per-agent and per-source numbers.
 */
export function salesLeaks({ leads, calls, users, today, now = Date.now() }) {
  const byLead = new Map();
  for (const c of [...calls].sort((a, b) => a.started_at - b.started_at)) {
    if (!c.lead_id) continue;
    if (!byLead.has(c.lead_id)) byLead.set(c.lead_id, []);
    byLead.get(c.lead_id).push(c);
  }
  const callsOf = (l) => byLead.get(l.id) || [];
  const analysed = calls.filter((c) => c.processing === 'done' && A(c));

  // ---- funnel
  const reached = (l) => callsOf(l).some(isConnected);
  const keen = (l) => ['interested', 'follow_up', 'won'].includes(l.status) || callsOf(l).some((c) => ['interested', 'follow_up', 'converted'].includes(c.outcome));
  const stages = [
    ['leads', 'Leads received', leads],
    ['called', 'Called at least once', leads.filter((l) => callsOf(l).length)],
    ['connected', 'Spoke to the lead', leads.filter(reached)],
    ['interested', 'Showed interest', leads.filter(keen)],
    ['won', 'Converted (won)', leads.filter((l) => l.status === 'won')],
  ];
  const funnel = stages.map(([key, label, list], i) => ({
    key, label, count: list.length,
    pct_of_leads: pct(list.length, leads.length),
    drop_from_prev: i ? stages[i - 1][2].length - list.length : 0,
  }));

  // ---- leaks
  const leaks = [];
  const add = (key, title, why, action, items, severity = 'high') => { if (items.length) leaks.push({ key, title, why, action, count: items.length, severity, items: items.slice(0, 50) }); };

  add('never_called', 'Leads never called',
    'These leads came in more than a day ago and nobody has called them. Most leads go cold within hours.',
    'Assign them now and call today, newest first.',
    leads.filter((l) => OPEN(l) && !callsOf(l).length && now - l.created_at > DAY).map((l) => ref(l, { note: `${Math.floor((now - l.created_at) / DAY)} days waiting` })));

  const firstGaps = leads.map((l) => (callsOf(l)[0] ? callsOf(l)[0].started_at - l.created_at : null)).filter((g) => g != null && g >= 0);
  const avgFirstCallHours = firstGaps.length ? Math.round((firstGaps.reduce((a, b) => a + b, 0) / firstGaps.length / HOUR) * 10) / 10 : null;
  add('slow_first_call', 'Slow first call (over 1 hour)',
    'A lead called within the first hour is far more likely to pick up and buy than one called the next day.',
    'Call every new lead within 15 minutes. Turn on the lead webhook so leads arrive instantly.',
    leads.filter((l) => callsOf(l)[0] && callsOf(l)[0].started_at - l.created_at > HOUR)
      .map((l) => ref(l, { note: `first call after ${Math.round((callsOf(l)[0].started_at - l.created_at) / HOUR)} h` })), 'medium');

  add('missed_follow_ups', 'Follow-ups missed',
    'The lead agreed to a callback, the date has passed, and nobody called.',
    'Open Leads → "Due today" every morning and clear the list first.',
    leads.filter((l) => OPEN(l) && l.next_follow_up && l.next_follow_up < today &&
      !callsOf(l).some((c) => c.started_at >= Date.parse(l.next_follow_up + 'T00:00:00+05:30')))
      .map((l) => ref(l, { note: `due ${l.next_follow_up}` })));

  add('not_retried', 'Unanswered and never tried again',
    'The lead did not pick up and nobody called again. Many leads answer on the 2nd or 3rd attempt.',
    'Retry unanswered leads 3 times over 2 days at different times of day.',
    leads.filter((l) => {
      const cs = callsOf(l);
      return OPEN(l) && cs.length && !cs.some(isConnected) && cs.length < 3 && now - cs.at(-1).started_at > DAY;
    }).map((l) => ref(l, { note: `${callsOf(l).length} attempt${callsOf(l).length > 1 ? 's' : ''}, no answer` })));

  const interestedNoNext = analysed.filter((c) => ['interested'].includes(c.outcome) && (!A(c).next_action || (A(c).skills?.closing ?? 10) <= 4));
  add('no_close', 'Interested leads not asked to buy',
    'The lead was interested, but the agent ended the call without asking for the order or fixing a next step.',
    'End every interested call with a clear ask: a booking, a visit or a fixed callback time.',
    interestedNoNext.map((c) => ({ id: c.lead_id, call_id: c.id, name: c.lead_name || 'Lead', owner_id: c.agent_id, note: `closing ${A(c).skills?.closing ?? '–'}/10` })));

  const unhandled = analysed.filter((c) => c.outcome !== 'converted').flatMap((c) => (A(c).objections || []).filter((o) => !o.handled_well).map((o) => ({ c, o })));
  add('objections', 'Objections left unanswered',
    'The lead raised a doubt (price, timing, competitor) and the agent did not answer it well.',
    'Write a short answer for each common objection into your script and practise it.',
    unhandled.map(({ c, o }) => ({ id: c.lead_id, call_id: c.id, name: c.lead_name || 'Lead', owner_id: c.agent_id, note: o.objection })));

  add('early_hangup', 'Lost in the first minute',
    'Connected calls under 60 seconds that ended "not interested". Usually the opening line failed.',
    'Open with who you are, why you are calling and a benefit, all in the first 15 seconds.',
    calls.filter((c) => c.status === 'completed' && c.outcome === 'not_interested' && (c.duration_sec || 0) < 60)
      .map((c) => ({ id: c.lead_id, call_id: c.id, name: c.lead_name || 'Lead', owner_id: c.agent_id, note: `${c.duration_sec}s call` })), 'medium');

  add('red_flags', 'Red flags on calls',
    'Rudeness, false promises, wrong prices or an upset lead. These lose the sale and hurt your brand.',
    'Listen to these calls with the agent this week.',
    analysed.flatMap((c) => (A(c).red_flags || []).map((f) => ({ id: c.lead_id, call_id: c.id, name: c.lead_name || 'Lead', owner_id: c.agent_id, note: f }))));

  const rank = { high: 0, medium: 1 };
  leaks.sort((a, b) => rank[a.severity] - rank[b.severity] || b.count - a.count);

  // ---- why leads said no / what agents skip
  const tally = (xs) => Object.entries(xs.reduce((m, x) => { const k = x.trim().toLowerCase().slice(0, 90); if (k) m[k] = (m[k] || 0) + 1; return m; }, {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([text, count]) => ({ text, count }));
  const lostCalls = analysed.filter((c) => c.outcome === 'not_interested');
  const lost_reasons = tally(lostCalls.flatMap((c) => (A(c).objections || []).map((o) => o.objection)).concat(lostCalls.filter((c) => !(A(c).objections || []).length).map((c) => A(c).lead_intent || '')));
  const missed_steps = tally(analysed.flatMap((c) => A(c).script_adherence?.missed || []));
  const skillAvg = Object.fromEntries(SKILLS.map((k) => {
    const v = analysed.map((c) => A(c).skills?.[k]).filter(Number.isFinite);
    return [k, v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null];
  }));
  const weakest_skills = Object.entries(skillAvg).filter(([, v]) => v != null).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([k, v]) => ({ skill: k, label: SKILL_LABELS[k], avg: v }));

  // ---- by agent and by source
  const by_agent = users.map((u) => {
    const mine = leaks.map((lk) => [lk.key, lk.items.filter((i) => i.owner_id === u.id).length]);
    const own = leads.filter((l) => l.owner_id === u.id);
    return {
      agent_id: u.id, name: u.name, leads: own.length, won: own.filter((l) => l.status === 'won').length,
      lost: own.filter((l) => l.status === 'lost').length,
      conversion_pct: pct(own.filter((l) => l.status === 'won').length, own.length),
      leaks: Object.fromEntries(mine), total_leaks: mine.reduce((s, [, n]) => s + n, 0),
    };
  }).filter((a) => a.leads || a.total_leaks).sort((a, b) => b.total_leaks - a.total_leaks);

  const sources = {};
  for (const l of leads) {
    const s = l.source || 'Unknown';
    sources[s] ||= { source: s, leads: 0, won: 0, lost: 0 };
    sources[s].leads++; if (l.status === 'won') sources[s].won++; if (l.status === 'lost') sources[s].lost++;
  }
  const by_source = Object.values(sources).map((s) => ({ ...s, conversion_pct: pct(s.won, s.leads) })).sort((a, b) => b.leads - a.leads);

  return {
    funnel, leaks, avg_first_call_hours: avgFirstCallHours,
    leads_at_risk: new Set(leaks.filter((l) => ['never_called', 'missed_follow_ups', 'not_retried'].includes(l.key)).flatMap((l) => l.items.map((i) => i.id))).size,
    lost_reasons, missed_steps, weakest_skills, by_agent, by_source,
  };
}

/**
 * One day of activity per agent. Times are shown in the business time zone,
 * so `tzOffsetMin` shifts timestamps (India = 330).
 */
export function productivity({ calls, users, target = 60, tzOffsetMin = 330 }) {
  const hourOf = (ms) => new Date(ms + tzOffsetMin * 60000).getUTCHours();
  const agents = users.map((u) => {
    const mine = calls.filter((c) => c.agent_id === u.id).sort((a, b) => a.started_at - b.started_at);
    const connected = mine.filter(isConnected);
    const hours = Array(24).fill(0);
    mine.forEach((c) => { hours[hourOf(c.started_at)]++; });
    let longestGap = 0;
    for (let i = 1; i < mine.length; i++) {
      const prevEnd = mine[i - 1].started_at + (mine[i - 1].duration_sec || 0) * 1000;
      longestGap = Math.max(longestGap, mine[i].started_at - prevEnd);
    }
    const span = mine.length > 1 ? mine.at(-1).started_at - mine[0].started_at : 0;
    const talk = mine.reduce((s, c) => s + (c.duration_sec || 0), 0);
    return {
      agent_id: u.id, name: u.name,
      calls: mine.length, connected: connected.length,
      connect_pct: pct(connected.length, mine.length),
      converted: mine.filter((c) => c.outcome === 'converted').length,
      talk_time_sec: talk,
      first_call: mine[0]?.started_at || null,
      last_call: mine.at(-1)?.started_at || null,
      active_hours: Math.round((span / HOUR) * 10) / 10,
      calls_per_hour: span ? Math.round((mine.length / (span / HOUR)) * 10) / 10 : mine.length,
      longest_gap_min: Math.round(longestGap / 60000),
      target, target_pct: Math.min(999, Math.round((mine.length / (target || 1)) * 100)),
      hours,
    };
  }).sort((a, b) => b.calls - a.calls);

  // Best hours to call: connect rate per hour across the team.
  const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, calls: 0, connected: 0 }));
  for (const c of calls) { const h = byHour[hourOf(c.started_at)]; h.calls++; if (isConnected(c)) h.connected++; }
  const hours = byHour.filter((h) => h.calls).map((h) => ({ ...h, connect_pct: pct(h.connected, h.calls) }));
  const best_hours = [...hours].filter((h) => h.calls >= 3).sort((a, b) => b.connect_pct - a.connect_pct).slice(0, 3);

  return { agents, hours, best_hours, target };
}
