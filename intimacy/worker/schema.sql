-- Intimacy for Couples: only numbers, names and pairings. No game data, chats or media.
CREATE TABLE IF NOT EXISTS users (
  number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS pairs (
  a TEXT NOT NULL,
  b TEXT NOT NULL,
  created INTEGER NOT NULL,
  PRIMARY KEY (a, b)
);
CREATE TABLE IF NOT EXISTS requests (
  from_n TEXT NOT NULL,
  to_n TEXT NOT NULL,
  created INTEGER NOT NULL,
  PRIMARY KEY (from_n, to_n)
);
CREATE INDEX IF NOT EXISTS requests_to ON requests (to_n, created);
CREATE INDEX IF NOT EXISTS requests_from ON requests (from_n, created);
