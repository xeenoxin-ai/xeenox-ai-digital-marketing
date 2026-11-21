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
  updated_at INTEGER NOT NULL
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
