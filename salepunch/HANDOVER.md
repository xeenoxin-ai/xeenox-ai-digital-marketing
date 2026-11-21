# SalePunch — handover notes

Give this file to whoever (or whichever AI) continues the work. It says what SalePunch is, where everything lives, how to deploy, and what is still open.

## What it is

Sales-call monitoring + CRM for Indian sales teams. It records every call, transcribes it (all Indian languages, with English translation), scores conversion chance, script adherence and sales skills, shows where sales are lost and agent productivity, and sends a daily per-agent report. Users sign in with Gmail. Plans on the landing page: ₹4,999 / ₹6,999 / ₹8,999 a month (payments are not built yet).

Live app: https://salepunch.xeenox-in.workers.dev

## Where things are

- Code: GitHub repo `xeenoxin-ai/xeenox-ai-digital-marketing`, folder `salepunch/`. Pull request #36 was merged into `main`.
- Tests: `tests/salepunch.test.js` (run `node --test tests/salepunch.test.js` from the repo root).
- Android app source: `salepunch/android/`. GitHub Actions workflow `.github/workflows/salepunch-android.yml` builds the APK. The built APK is `salepunch/public/salepunch.apk`, served at `/download`.

## How it runs (all on Cloudflare, free AI)

- **Cloudflare Worker** `salepunch` — `src/worker.js` is the router (API + bundled static pages from `public/`).
- **D1 database** `salepunch` (id `d808f24d-5146-4835-9f20-c40f920427c3`), schema in `schema.sql`, changes in `migrations/`. Recordings are stored inside D1 (`recording_chunks`, 1 MB pieces) because R2 is not enabled on the account.
- **Workers AI** (free tier): Whisper large-v3-turbo for transcription/translation (`src/transcribe.js`), Llama 3.3 70B for full analysis and Llama 3.1 8B for the quick result and live coaching (`src/analyze.js`).
- **Queue** `salepunch-calls` — analysis runs in the queue consumer (`src/pipeline.js`) so long calls are not cut off.
- **Cron** hourly — retries stuck calls; daily report at 21:00 IST.
- **Cloudflare Realtime TURN** — for the internet call (WebRTC).

Secrets set on the worker (values are in Cloudflare, never in the code): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `WEBHOOK_SECRET`, `LEADS_WEBHOOK_KEY`, `TURN_KEY_ID`, `TURN_KEY_SECRET`. Google sign-in is configured in Google Cloud Console with redirect `https://salepunch.xeenox-in.workers.dev/api/auth/google/callback`.

## How to deploy a change

On your own computer (Node.js installed):

```
git clone https://github.com/xeenoxin-ai/xeenox-ai-digital-marketing.git
cd xeenox-ai-digital-marketing/salepunch
npx wrangler login          # sign in to the Cloudflare account that owns salepunch
npx wrangler deploy
```

Database change: add a file in `migrations/`, then `npx wrangler d1 execute salepunch --remote --file migrations/<file>.sql`.

## How calling works today

On a computer, clicking **Call** asks how to call (`startCall` / `chooseCall` in `public/app.js`):

1. **Call their mobile, talk on this headset (free, recommended)** — opens `tel:` so Windows **Phone Link** dials from the agent's Android phone and plays the call in the PC headset. SalePunch captures mic + system audio (`LiveListener`, `openLivePanel`) and transcribes both sides live.
2. **Internet call (WhatsApp link)** — WebRTC; the lead must open the link `/talk/<token>` and tap Join call.
3. **Ring their mobile from my phone** — the SalePunch Android app dials from its SIM and uploads the phone's own recording.

On the Android app itself, calls dial from the SIM and the recording is uploaded automatically.

## Open problem (start here)

The owner tested on a PC and **could not hear the lead in the headset**. Database showed: SIM calls captured only the agent's voice (lead audio never reached the PC); the two internet-call attempts ended before the lead opened the link. The fix just shipped is option 1 above (Phone Link) with a setup guide in the app. Next step: owner sets up Phone Link (Bluetooth needed) and tests a real call.

Truly phone-free calling to normal mobile numbers needs a paid licensed provider (Exotel is partly integrated in `src/telephony.js`; would need its WebRTC softphone). The owner wants free for now.

## Working status on 21 November 2026

- A local copy of SalePunch opened its home page, app, and Android download page. It read its local database and served the Android installer bundled with the project.
- All 97 automated repository tests passed, including 34 SalePunch tests.
- The cloud development environment blocked access to the live SalePunch site, so the live site and Google sign-in still need a check.
- A real call with Windows Phone Link still needs to confirm two things. The salesperson can hear the customer in the headset, and the recording contains both voices.

## Not built yet (ideas offered)

- Payments / subscriptions for the three plans, multi-company workspaces.
- Own domain instead of workers.dev.
- R2 storage for recordings (enable R2 in Cloudflare, uncomment in `wrangler.toml`).
- Exotel softphone for phone-free calling.
