-- SalePunch database (Cloudflare D1 / SQLite).
-- Apply: npx wrangler d1 execute salepunch --remote --file salepunch/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,                       -- agent's mobile; telephony rings this first
  role TEXT NOT NULL DEFAULT 'agent', -- 'admin' | 'manager' | 'agent'
  pass_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source TEXT,                      -- Meta ads, website, walk-in, import...
  status TEXT NOT NULL DEFAULT 'new', -- new | contacted | interested | follow_up | won | lost
  owner_id TEXT REFERENCES users(id),
  notes TEXT,
  next_follow_up TEXT,              -- YYYY-MM-DD
  external_id TEXT,                 -- id in an outside CRM
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  company TEXT,
  city TEXT,
  deal_value INTEGER,               -- expected deal size in rupees
  expected_close TEXT,              -- YYYY-MM-DD
  tags TEXT                         -- comma-separated
);
CREATE INDEX IF NOT EXISTS leads_owner ON leads(owner_id, status);
CREATE INDEX IF NOT EXISTS leads_phone ON leads(phone);

CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES users(id),
  lead_id TEXT REFERENCES leads(id),
  lead_phone TEXT,
  direction TEXT NOT NULL DEFAULT 'outbound',
  provider TEXT NOT NULL,           -- 'exotel' | 'upload'
  provider_call_id TEXT,
  status TEXT NOT NULL,             -- dialing | completed | no_answer | busy | failed
  -- processing: pending | transcribing | analyzing | done | error | skipped
  processing TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  started_at INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  recording_url TEXT,               -- provider URL (fetched once, then kept in R2)
  recording_key TEXT,               -- R2 object key
  language TEXT,
  transcript TEXT,                  -- JSON [{speaker, start, text}]
  analysis TEXT,                    -- JSON from analyze.js
  outcome TEXT,                     -- converted | interested | follow_up | not_interested | no_conversation
  conversion_chance INTEGER,        -- 0-100
  skill_score INTEGER,              -- 0-100 overall
  day TEXT NOT NULL                 -- YYYY-MM-DD in the business time zone
);
CREATE INDEX IF NOT EXISTS calls_day ON calls(day, agent_id);
CREATE INDEX IF NOT EXISTS calls_lead ON calls(lead_id, started_at);
CREATE INDEX IF NOT EXISTS calls_provider ON calls(provider, provider_call_id);
CREATE INDEX IF NOT EXISTS calls_processing ON calls(processing);

CREATE TABLE IF NOT EXISTS reports (
  day TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  stats TEXT NOT NULL,              -- JSON
  coaching TEXT,                    -- AI coaching note for the agent
  created_at INTEGER NOT NULL,
  PRIMARY KEY (day, agent_id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Agents' phones running the SalePunch app (computer → phone calling).
CREATE TABLE IF NOT EXISTS devices (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  seen_at INTEGER NOT NULL,
  app_version TEXT
);

-- Call audio kept inside SalePunch when no R2 bucket is bound (1 MB pieces).
CREATE TABLE IF NOT EXISTS recording_chunks (
  call_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (call_id, seq)
);

-- CRM: notes, tasks and the activity history on each lead.
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  user_id TEXT,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS notes_lead ON notes(lead_id, created_at);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  user_id TEXT NOT NULL,            -- who should do it
  title TEXT NOT NULL,
  due_at TEXT,                      -- YYYY-MM-DDTHH:MM (India time)
  done INTEGER NOT NULL DEFAULT 0,
  done_at INTEGER,
  created_by TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tasks_user ON tasks(user_id, done, due_at);
CREATE INDEX IF NOT EXISTS tasks_lead ON tasks(lead_id);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  user_id TEXT,
  kind TEXT NOT NULL,               -- created | status | owner | value | assigned
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS activities_lead ON activities(lead_id, created_at);

-- Live calls: what each side said, written out every few seconds during the
-- call (speaker "agent" / "lead"), plus live AI coach tips (speaker "coach").
CREATE TABLE IF NOT EXISTS live_segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  call_id TEXT NOT NULL,
  start REAL NOT NULL,              -- seconds from the start of listening
  speaker TEXT NOT NULL,
  text TEXT NOT NULL,               -- as spoken
  en TEXT,                          -- English translation (when not English)
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS live_call ON live_segments(call_id, start);
