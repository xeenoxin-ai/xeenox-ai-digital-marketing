// Per-agent numbers for a day (or any set of calls). Pure, so it is tested.
import { SKILLS } from './constants.js';
import { safeJson } from './util.js';

const avg = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

/**
 * calls: rows from the calls table (analysis as JSON text or object).
 * "Connected" = a real conversation happened (completed, 20s+, not no_conversation).
 * Conversion % = converted / connected.
 */
export function agentStats(calls) {
  const connected = calls.filter(isConnected);
  const analysed = connected.filter((c) => c.processing === 'done' && c.skill_score != null);
  const by = (o) => connected.filter((c) => c.outcome === o).length;
  const skills = {};
  for (const k of SKILLS) {
    skills[k] = avg(analysed.map((c) => parseA(c)?.skills?.[k]).filter((v) => Number.isFinite(v)));
  }
  const objections = {};
  for (const c of analysed) for (const o of parseA(c)?.objections || []) {
    const key = o.objection.toLowerCase().slice(0, 80);
    objections[key] = (objections[key] || 0) + 1;
  }
  return {
    dialed: calls.length,
    connected: connected.length,
    talk_time_sec: calls.reduce((s, c) => s + (Number(c.duration_sec) || 0), 0),
    avg_call_sec: avg(connected.map((c) => Number(c.duration_sec) || 0)) || 0,
    converted: by('converted'),
    interested: by('interested'),
    follow_up: by('follow_up'),
    not_interested: by('not_interested'),
    conversion_pct: connected.length ? Math.round((by('converted') / connected.length) * 1000) / 10 : 0,
    avg_conversion_chance: avg(analysed.map((c) => c.conversion_chance).filter((v) => v != null)),
    avg_skill_score: avg(analysed.map((c) => c.skill_score)),
    skills,
    red_flags: analysed.reduce((n, c) => n + (parseA(c)?.red_flags?.length || 0), 0),
    top_objections: Object.entries(objections).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([objection, count]) => ({ objection, count })),
    pending_analysis: calls.filter((c) => !['done', 'skipped', 'error'].includes(c.processing)).length,
  };
}

export function isConnected(c) {
  return c.status === 'completed' && (Number(c.duration_sec) || 0) >= 20 && c.outcome !== 'no_conversation';
}

function parseA(c) {
  if (c.analysis && typeof c.analysis === 'object') return c.analysis;
  return safeJson(c.analysis);
}

/** Groups calls by agent and adds team totals. */
export function teamStats(calls, users) {
  const rows = users.map((u) => ({ agent_id: u.id, name: u.name, ...agentStats(calls.filter((c) => c.agent_id === u.id)) }));
  rows.sort((a, b) => b.converted - a.converted || (b.avg_skill_score ?? -1) - (a.avg_skill_score ?? -1) || b.connected - a.connected);
  return { agents: rows, team: agentStats(calls) };
}
