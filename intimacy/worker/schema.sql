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

-- Community: anonymous experiences. Every post is reviewed (status 'pending') before it goes live.
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  n TEXT NOT NULL,
  handle TEXT NOT NULL,
  topic TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  likes INTEGER NOT NULL DEFAULT 0,
  reports INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS stories_live ON stories (status, created);
CREATE INDEX IF NOT EXISTS stories_author ON stories (n, created);
CREATE TABLE IF NOT EXISTS story_likes (story_id INTEGER NOT NULL, n TEXT NOT NULL, PRIMARY KEY (story_id, n));
CREATE TABLE IF NOT EXISTS story_reports (story_id INTEGER NOT NULL, n TEXT NOT NULL, PRIMARY KEY (story_id, n));

-- Comments on live community stories. Auto-filtered; 2 reports hide a comment until the admin reviews it.
CREATE TABLE IF NOT EXISTS story_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  n TEXT NOT NULL,
  handle TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  reports INTEGER NOT NULL DEFAULT 0,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_story ON story_comments (story_id, status, created);
CREATE INDEX IF NOT EXISTS comments_author ON story_comments (n, created);
CREATE TABLE IF NOT EXISTS comment_reports (comment_id INTEGER NOT NULL, n TEXT NOT NULL, PRIMARY KEY (comment_id, n));
