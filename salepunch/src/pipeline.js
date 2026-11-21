// After a call ends: keep the recording in R2, transcribe it, analyse it,
// update the lead, and tell the outside CRM. Also the daily report job.
import { analyzeCall, coachingNote, quickAnalysis, talkRatio } from './analyze.js';
import { crmEvent, leadStatusAfterCall, postWebhook } from './crm.js';
import { agentStats } from './stats.js';
import { STATUS_LABELS } from './constants.js';
import { fetchRecording } from './telephony.js';
import { loadRecording, saveRecording } from './storage.js';
import { transcribeAndTranslate } from './transcribe.js';
import { dayOf, safeJson } from './util.js';

/**
 * Sends a call to the processing queue (no 30-second limit, automatic retries).
 * Without a queue binding it runs in the background of the current request.
 */
export async function enqueueCall(env, callId, ctx) {
  if (env.CALLS) {
    await env.CALLS.send({ id: callId });
    return;
  }
  const job = processCall(env, callId);
  if (ctx) ctx.waitUntil(job); else await job;
}

export async function getSettings(db) {
  const { results } = await db.prepare('SELECT key, value FROM settings').all();
  return Object.fromEntries(results.map((r) => [r.key, r.value]));
}

const setCall = (db, id, fields) => {
  const keys = Object.keys(fields);
  return db.prepare(`UPDATE calls SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`).bind(...keys.map((k) => fields[k]), id).run();
};

/**
 * Processes one call: recording → transcript (+ English translation for other
 * languages) → quick AI verdict (about 4 s) → full AI analysis → lead update.
 * Every stage is saved, so the call page fills in as it goes. Safe to run again.
 */
export async function processCall(env, callId, { deps = {} } = {}) {
  const db = env.DB;
  const call = await db.prepare('SELECT * FROM calls WHERE id = ?').bind(callId).first();
  if (!call) return;
  try {
    let segments = safeJson(call.transcript, null);
    let language = call.language || '';
    let original = null;
    if (!segments) {
      if (!call.recording_key && !call.recording_url) {
        await setCall(db, callId, { processing: 'skipped', error: null });
        return;
      }
      await setCall(db, callId, { processing: 'transcribing', error: null });
      let bytes;
      if (call.recording_key) {
        const rec = await loadRecording(env, call);
        if (!rec) throw new Error('Recording file missing from storage');
        bytes = rec.bytes;
      } else {
        // Telephony recording (Exotel): fetch it once and keep our own copy inside SalePunch.
        const rec = await (deps.fetchRecording || fetchRecording)(call.recording_url, env);
        bytes = rec.bytes;
        const key = await saveRecording(env, call, bytes, rec.type);
        await setCall(db, callId, { recording_key: key });
      }
      const t = await (deps.transcribe || transcribeAndTranslate)(bytes, env, { language: env.CALL_LANGUAGE || undefined });
      segments = t.segments;
      language = t.language;
      if (t.translated) original = { language: t.language, text: t.original.map((x) => x.text).join(' ').slice(0, 20000) };
    }
    if (!segments.length) {
      await setCall(db, callId, { processing: 'done', error: null, transcript: '[]', outcome: 'no_conversation', conversion_chance: 0,
        analysis: JSON.stringify({ outcome: 'no_conversation', summary: 'No speech was found in the recording.', skills: {}, script_adherence: { score: 0, followed: [], missed: [] }, objections: [], strengths: [], improvements: [], red_flags: [], key_moments: [], engine: 'none' }) });
      return;
    }
    await setCall(db, callId, { processing: 'analyzing', transcript: JSON.stringify(segments), language });

    const [settings, lead, agent] = await Promise.all([
      getSettings(db),
      call.lead_id ? db.prepare('SELECT * FROM leads WHERE id = ?').bind(call.lead_id).first() : null,
      call.agent_id ? db.prepare('SELECT id, name, email FROM users WHERE id = ?').bind(call.agent_id).first() : null,
    ]);
    const durationSec = call.duration_sec || Math.round(segments.at(-1)?.end || 0);
    const input = { segments, script: settings.script, product: settings.product, lead, agentName: agent?.name, durationSec, today: call.day };

    // Quick verdict and full analysis run together; the quick one shows first.
    let fullDone = false;
    const quick = env.AI && !env.ANTHROPIC_API_KEY && !deps.claude
      ? quickAnalysis(input, env).then(async (q) => {
        if (fullDone) return;
        await setCall(db, callId, { analysis: JSON.stringify({ ...q, original }), outcome: q.outcome, conversion_chance: q.conversion_chance });
      }).catch((e) => console.log('quick analysis failed', e.message))
      : Promise.resolve();
    const analysis = await analyzeCall(input, env, deps.claude);
    fullDone = true;
    await quick;
    // Live calls (and labelled pasted transcripts) already know who spoke each line.
    const known = segments.every((s) => s.speaker === 'agent' || s.speaker === 'lead');
    const speakers = known ? segments.map((s) => s.speaker) : analysis.speakers;
    const labelled = segments.map((s, i) => ({ start: s.start, text: s.text, speaker: speakers[i] }));
    analysis.talk_ratio = talkRatio(segments, speakers);
    delete analysis.speakers;
    if (original) analysis.original = original;
    else if (call.analysis) { const prev = safeJson(call.analysis, {}); if (prev?.original) analysis.original = prev.original; }

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
      const acts = [];
      if (status !== lead.status) acts.push(['status', `Stage: ${STATUS_LABELS[lead.status] || lead.status} → ${STATUS_LABELS[status] || status} (from the call)`]);
      if (analysis.follow_up_date && analysis.follow_up_date !== lead.next_follow_up) acts.push(['followup', `Follow-up set for ${analysis.follow_up_date} (from the call)`]);
      for (const [kind, text] of acts) {
        await db.prepare('INSERT INTO activities (id, lead_id, user_id, kind, text, created_at) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(crypto.randomUUID().replaceAll('-', '').slice(0, 20), lead.id, call.agent_id || null, kind, text, Date.now()).run();
      }
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
  await env.DB.prepare("UPDATE calls SET status = 'failed', processing = 'skipped', error = 'The phone did not pick up this call in time' WHERE status = 'queued' AND started_at < ?")
    .bind(now - 120000).run();
  const { results } = await env.DB.prepare(
    "SELECT id FROM calls WHERE processing IN ('pending','transcribing','analyzing') AND status = 'completed' AND started_at < ? LIMIT 10",
  ).bind(now - 10 * 60000).all();
  for (const r of results) await enqueueCall(env, r.id);
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
