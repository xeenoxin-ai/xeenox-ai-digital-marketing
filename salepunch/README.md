# SalePunch: sales call monitoring

**Live:** https://salepunch.xeenox-in.workers.dev (home page with pricing) · the app is at `/app`

SalePunch records every sales call from "hello" to the end, turns it into a
written conversation, and tells you whether the agent is actually trying to
convert the lead.

| What you get | How |
| --- | --- |
| **Every call recorded** | Agents press **Call** next to a lead. The call goes through your company number (Exotel), so every call is recorded, even when agents use their own mobile. |
| **Full conversation** | The recording is transcribed (English, Malayalam, Hindi, Tamil, mixed), split into *Agent* and *Lead* turns, and shown like a chat next to the audio player. Tap a timestamp to hear that moment. |
| **Is the agent converting?** | For each call, the AI gives the result (converted / interested / follow-up / not interested), the lead's chance to buy (0-100%), the lead's objections and whether the agent answered them, and the next step and follow-up date. |
| **Sales-skill score** | Each call is scored 0-100, with 0-10 for opening, need discovery, pitch, objection handling, closing, tone and listening. It also gives the agent's share of the talking. |
| **Script check** | You paste your sales script in Settings. Each call shows which steps the agent followed and which they skipped. |
| **Red flags** | Rudeness, false promises, wrong prices and upset leads are flagged on the call and on the dashboard. |
| **Daily view per agent** | Calls dialed, connected, talk time, conversions, conversion %, average skill score, weakest skill and top objections, for any day. |
| **Daily reports** | Every evening (21:00 IST) each agent gets a report and a short AI coaching note. The team summary can go to Slack, Google Chat, or WhatsApp/email through Zapier. |
| **CRM** | A lead list is built in (statuses, owners, follow-up dates, CSV import, click-to-call). Leads can come in from website forms, Meta Lead Ads, Zoho or HubSpot by webhook. After each call, SalePunch sends the result back to your CRM. |
| **Sales leak finder** | Shows where sales are lost: the lead funnel with drop-off at each step, and leaks ranked by impact. Leaks include leads never called, slow first calls, missed follow-ups, unanswered leads never retried, interested leads not asked to buy, objections left unanswered, calls lost in the first minute and red flags. Each leak lists the leads affected and a fix. It also shows why leads said no, the script steps most often skipped, leaks per agent and conversion by lead source. |
| **Productivity** | Per agent per day: calls against target, connect rate, talk time, conversions, first and last call, calls per hour and longest break. Also an hour-by-hour heatmap and the hours when leads actually pick up. |
| **Home page & plans** | A public home page at `/` with Starter ₹4,999, Growth ₹6,999 and Pro ₹8,999 per month (+ GST). Its demo and plan forms create a lead in your own SalePunch CRM, with the source "Website · <plan> plan". |
| **Roles** | Admins and managers see the whole team. Agents see only their own leads and calls. |

## How calls get recorded

Calls from a normal SIM can't be recorded by a server, so SalePunch places
calls through **cloud telephony**:

1. The agent presses **Call** on a lead.
2. Exotel rings the agent's mobile. When the agent answers, Exotel dials the
   lead and shows your **company number** (ExoPhone) as the caller ID.
3. Exotel records both sides (agent and lead on separate channels).
4. When the call ends, Exotel sends SalePunch the recording. SalePunch stores
   it, transcribes it, analyses it and updates the lead.

Agents keep using their own phones, and the lead sees your company number.
(Calls that leads make *to* your number are not in SalePunch yet; that is a
likely next step.)

**Calls made outside SalePunch** (for example from a phone's own dialer) can be
added on **Add a call**: upload the phone's recording file, or paste what was
said.

> **Recording consent (India):** tell leads the call is recorded. Set an Exotel
> greeting such as "This call may be recorded for quality and training". Keep
> recordings only as long as you need them (DPDP Act 2023).

## Running it (Cloudflare)

Everything runs on Cloudflare: Workers (app and API), D1 (database) and
Workers AI (speech-to-text). Claude does the call analysis. R2 file storage is
optional. With it, SalePunch keeps its own copy of every recording. Without
it, Exotel recordings are played straight from Exotel, and uploaded audio is
transcribed but not kept. To turn it on, enable R2 in the Cloudflare dashboard,
run `npx wrangler r2 bucket create salepunch-recordings`, and uncomment the
`r2_buckets` block in `wrangler.toml`.

```bash
npm install
```

```bash
npx wrangler d1 create salepunch
```

Copy the `database_id` it prints into `salepunch/wrangler.toml` (the current
one is already set for the Xeenox account), then:

```bash
npx wrangler d1 execute salepunch --remote --config salepunch/wrangler.toml --file salepunch/schema.sql
```

Set the secrets (run each one; it asks for the value):

```bash
cd salepunch
npx wrangler secret put SESSION_SECRET      # any random 32+ characters
npx wrangler secret put WEBHOOK_SECRET      # random string, protects the Exotel webhook
npx wrangler secret put LEADS_WEBHOOK_KEY   # random string, protects the lead webhook
npx wrangler secret put ANTHROPIC_API_KEY   # Claude API key from console.anthropic.com
```

```bash
npm run deploy:salepunch
```

Open the URL it prints, create the admin account, then:

1. **Team**: add each agent with their mobile number (this is the phone that rings).
2. **Settings**: paste your product details and sales script.
3. **Leads**: import a CSV, or connect your lead forms (below).

Set `APP_URL` in `wrangler.toml` to your final address (for example a custom
domain) so links in reports and CRM events point to the right place.

### Connect Exotel (the Call button)

1. Sign up at exotel.com, finish KYC and buy an **ExoPhone** (virtual number).
   You can also bring your existing company number.
2. In the Exotel dashboard → *API settings*, copy the **Account SID**,
   **API key** and **API token**.
3. Add them:

```bash
cd salepunch
npx wrangler secret put EXOTEL_SID
npx wrangler secret put EXOTEL_API_KEY
npx wrangler secret put EXOTEL_API_TOKEN
npx wrangler secret put EXOTEL_CALLER_ID    # your ExoPhone, e.g. 04912xxxxxx
npx wrangler secret put EXOTEL_SUBDOMAIN    # api.exotel.com (Singapore) or api.in.exotel.com (Mumbai)
```

SalePunch sets the call-end webhook on each call itself, so nothing else needs
setting up in Exotel. Calls are capped at one hour.

### Connect your CRM or lead forms

- **Leads in:** Settings shows a webhook URL. POST JSON to it from your website
  form, or from Zapier / Make / Pabbly for Meta Lead Ads, Google Sheets, Zoho or
  HubSpot. Field names are matched loosely (`name`/`full_name`, `phone`/`mobile`/
  `phone_number`, `email`, `source`/`campaign_name`, `owner` = agent email).
  Meta's `field_data` format works as is. Duplicate phone numbers are skipped.
- **Results out:** put a webhook URL in Settings (for example a Zapier catch
  hook that updates the contact in Zoho or HubSpot). After every analysed call
  SalePunch POSTs:

```json
{ "event": "call.analyzed", "call_id": "…", "call_url": "https://…/#/calls/…",
  "agent": { "name": "Anu", "email": "anu@…" },
  "lead": { "id": "…", "external_id": "your CRM id", "name": "…", "phone": "+91…", "status": "follow_up" },
  "outcome": "follow_up", "conversion_chance": 45, "skill_score": 58,
  "summary": "…", "next_action": "…", "follow_up_date": "2026-11-23",
  "objections": ["Too expensive"], "red_flags": [] }
```

### Language and AI settings

- `CALL_LANGUAGE` (in `wrangler.toml` vars): force the speech-to-text language
  (`ml`, `hi`, `ta`, `en`). Leave it unset to detect it automatically.
- `CLAUDE_MODEL`: defaults to `claude-opus-5-5`.
- Without `ANTHROPIC_API_KEY` the app still works, but calls get only a rough
  keyword estimate instead of a real analysis.

## Local development

```bash
printf 'SESSION_SECRET=local-dev-secret-0123456789\nWEBHOOK_SECRET=dev\nLEADS_WEBHOOK_KEY=dev\n' > salepunch/.dev.vars
npx wrangler d1 execute salepunch --local --config salepunch/wrangler.toml --file salepunch/schema.sql
npm run dev:salepunch
```

Workers AI (speech-to-text) always runs on Cloudflare, so `wrangler dev` asks
you to log in. To try the app without logging in, use **Add a call → paste the
conversation**, which skips speech-to-text.

Tests: `npm test` (`tests/salepunch.test.js`).

## Code map

| File | What it does |
| --- | --- |
| `src/worker.js` | API routes, login, webhooks, the hourly/daily scheduled job |
| `src/telephony.js` | Exotel click-to-call, call-end webhook, recording download |
| `src/transcribe.js` | Speech-to-text (Workers AI Whisper), pasted transcripts |
| `src/analyze.js` | Claude call analysis (structured JSON), coaching notes, keyword fallback |
| `src/pipeline.js` | Recording → R2 → transcript → analysis → lead update → CRM webhook; daily reports |
| `src/stats.js` | Per-agent and team numbers |
| `src/insights.js` | Sales leak finder and productivity numbers |
| `public/landing.html` | Public home page with pricing |
| `src/crm.js` | Lead webhook mapping, CRM event, lead status rules |
| `schema.sql` | Database tables |
| `public/` | The dashboard (plain HTML/CSS/JS, no build step), bundled into the worker by `src/static.js` |
