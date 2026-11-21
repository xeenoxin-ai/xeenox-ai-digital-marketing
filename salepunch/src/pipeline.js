// After a call ends: keep the recording in R2, transcribe it, analyse it,
// update the lead, and tell the outside CRM. Also the daily report job.
import { analyzeCall, coachingNote, talkRatio } from './analyze.js';
import { crmEvent, leadStatusAfterCall, postWebhook } from './crm.js';
import { agentStats } from './stats.js';
import { fetchRecording } from './telephony.js';
import { transcribe } from './transcribe.js';
import { dayOf, safeJson } from './util.js';

export async function getSettings(db) {
  const { results } = await db.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(results.map((r) => [r.key, r.value]));
}

const setCall = (db, id, fields) => {
  const keys = Object.keys(fields);
  return db.prepare(`UPDATE calls SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).bind(...keys.map((k) => fields[k]), id).run();
};

/**
 * Processes one call. `textSegments` is set for pasted transcripts.
 * Safe to run again (Reprocess button / retry job).
 */
export async function processCall(env, callId, { textSegments, audio, deps = {} } = {}) {
  const db = env.DB;
  const call = await db.prepare('SELECT * FROM calls WHERE id = ?').bind(callId).first();
  if (!call) return;
  try {
    let segments = textSegments || safeJson(call.transcript, null);
    let language = call.language || '';
    if (!segments) {
      if (!call.recording_key && !call.recording_url && !audio) {
        await setCall(db, callId, { processing: 'skipped', error: null });
        return;
      }
      await setCall(db, callId, { processing: 'transcribing', error: null });
      let bytes;
      if (audio) {
        bytes = audio; // uploaded file, no file storage configured
      } else if (call.recording_key && env.RECORDINGS) {
        const obj = await env.RECORDINGS.get(call.recording_key);
        if (!obj) throw new Error('Recording file missing from storage');
        bytes = new Uint8Array(await obj.arrayBuffer());
      } else {
        const rec = await (deps.fetchRecording || fetchRecording)(call.recording_url, env);
        bytes = rec.bytes;
        if (env.RECORDINGS) { // keep our own copy; without R2 we play it from the provider
          const key = `calls/${call.day}/${call.id}.${rec.type.includes('wav') ? 'wav' : 'mp3'}`;
          await env.RECORDINGS.put(key, bytes, { httpMetadata: { contentType: rec.type } });
          await setCall(db, callId, { recording_key: key });
        }
      }
      const t = await (deps.transcribe || transcribe)(bytes, env, { language: env.CALL_LANGUAGE || undefined });
      segments = t.segments;
      language = t.language;
    }
    await setCall(db, callId, { processing: 'analyzing', transcript: JSON.stringify(segments), language });

    const [settings, lead, agent] = await Promise.all([
      getSettings(db),
      call.lead_id ? db.prepare('SELECT * FROM leads WHERE id = ?').bind(call.lead_id).first() : null,
      call.agent_id ? db.prepare('SELECT id, name, email FROM users WHERE id = ?').bind(call.agent_id).first() : null,
    ]);
    const durationSec = call.duration_sec || Math.round(segments.at(-1)?.end || 0);
    const analysis = await analyzeCall({ segments, script: settings.script, product: settings.product, lead, agentName: agent?.name, durationSec }, env, deps.claude);
    const labelled = segments.map((s, i) => ({ start: s.start, text: s.text, speaker: analysis.speakers[i] }));
    analysis.talk_ratio = talkRatio(segments, analysis.speakers);
    delete analysis.speakers;

    await setCall(db, callId, {
      processing: 'done',
      error: null,
      transcript: JSON.stringify(labelled),
      analysis: JSON.stringify(analysis),
      outcome: analysis.outcome,
      conversion_chance: analysis.conversion_chance,
      skill_score: analysis.overall_score,
      duration_sec: durationSec,
      language: language || analysis.language,
    });

    if (lead) {
      const status = leadStatusAfterCall(lead.status, analysis.outcome);
      await db.prepare('UPDATE leads SET status = ?, next_follow_up = COALESCE(?, next_follow_up), updated_at = ? WHERE id = ?')
        .bind(status, analysis.follow_up_date || null, Date.now(), lead.id).run();
      lead.status = status;
    }
    if (settings.crm_webhook_url) {
      await (deps.postWebhook || postWebhook)(settings.crm_webhook_url,
        crmEvent({ call: { ...call, duration_sec: durationSec }, lead, agent, analysis, appUrl: env.APP_URL })).catch((e) => console.log('CRM webhook failed', e.message));
    }
  } catch (e) {
    console.log('processCall failed', callId, e.stack || e.message);
    await setCall(db, callId, { processing: 'error', error: String(e.message || e).slice(0, 500) });
  }
}

/** Retries calls that got stuck (worker restarted mid-way). */
export async function retryStuck(env, now = Date.now()) {
  // Phone calls whose result never came back (app closed, no network): close them.
  await env.DB.prepare("UPDATE calls SET status = 'failed', processing = 'skipped', error = 'The phone never reported how this call ended' WHERE status = 'dialing' AND started_at < ?")
    .bind(now - 3 * 3600000).run();
  const { results } = await env.DB.prepare(
    "SELECT id FROM calls WHERE processing IN ('pending','transcribing','analyzing') AND status = 'completed' AND started_at < ? LIMIT 10",
  ).bind(now - 20 * 60000).all();
  for (const r of results) await processCall(env, r.id);
}

/** Builds and stores each agent's report for `day`, then posts a team summary. */
export async function dailyReport(env, day, deps = {}) {
  const db = env.DB;
  const { results: agents } = await db.prepare("SELECT id, name, email FROM users WHERE active = 1").all();
  const { results: calls } = await db.prepare('SELECT * FROM calls WHERE day = ?').bind(day).all();
  const lines = [];
  for (const a of agents) {
    const mine = calls.filter((c) => c.agent_id === a.id);
    if (!mine.length) continue;
    const stats = agentStats(mine);
    const summaries = mine.filter((c) => c.processing === 'done').map((c) => {
      const an = safeJson(c.analysis, {});
      return { outcome: c.outcome, skill_score: c.skill_score, conversion_chance: c.conversion_chance, summary: an.summary, improvements: an.improvements };
    });
    let coaching = '';
    try { coaching = await coachingNote({ agentName: a.name, stats, calls: summaries }, env, deps.claude); } catch (e) { console.log('coaching failed', e.message); }
    await db.prepare('INSERT OR REPLACE INTO reports (day, agent_id, stats, coaching, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(day, a.id, JSON.stringify(stats), coaching, Date.now()).run();
    lines.push(`• ${a.name}: ${stats.dialed} dialed, ${stats.connected} connected, ${stats.converted} converted (${stats.conversion_pct}%), skill ${stats.avg_skill_score ?? '–'}/100, talk ${Math.round(stats.talk_time_sec / 60)} min`);
  }
  const settings = await getSettings(db);
  if (settings.report_webhook_url && lines.length) {
    const text = `SalePunch daily report ${day}\n${lines.join('\n')}${env.APP_URL ? `\n${env.APP_URL}/#/reports/${day}` : ''}`;
    await (deps.postWebhook || postWebhook)(settings.report_webhook_url, { text }).catch((e) => console.log('report webhook failed', e.message));
  }
  return lines.length;
}

export const today = (env, now = Date.now()) => dayOf(now, env.TIMEZONE || 'Asia/Kolkata');
