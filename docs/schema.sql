-- TxT Sanitizer V2 — D1 Schema
-- Run with: wrangler d1 execute txt-sanitizer-d1 --file=docs/schema.sql --local
--       or: wrangler d1 execute txt-sanitizer-d1 --file=docs/schema.sql  (remote)

-- System presets (editable by admin, served via GET /api/presets)
CREATE TABLE IF NOT EXISTS presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rules TEXT NOT NULL,           -- JSON: Rule[]
  is_default INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,     -- incremented on admin update for cache-busting
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Notification alert banner (admin-controlled)
CREATE TABLE IF NOT EXISTS notification_alert (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled INTEGER DEFAULT 0,        -- 0 = off, 1 = on
  heading TEXT NOT NULL DEFAULT '',  -- brief one-line title shown in the alert bar
  has_learn_more INTEGER DEFAULT 0,  -- 0 = heading only, 1 = show Learn More button
  body TEXT DEFAULT '',              -- required when has_learn_more = 1
  version INTEGER DEFAULT 1,         -- bump to re-show to all users
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Popup configuration (admin-controlled first-visit modal)
CREATE TABLE IF NOT EXISTS popup_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content TEXT NOT NULL DEFAULT '',
  enabled INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- About page content (admin-editable CMS)
CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  html_content TEXT NOT NULL DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,   -- 'page_view' | 'sanitize' | 'feedback'
  metadata TEXT,              -- JSON blob
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Seeds ───────────────────────────────────────────────────────────────────────

-- Seed default presets (skip if already exists)
INSERT OR IGNORE INTO presets (id, name, rules, is_default, version) VALUES
(
  'default01',
  'ChatGPT → Normal',
  '[{"priority":1,"find":"**","replace":""},{"priority":2,"find":"*","replace":"-"},{"priority":3,"find":"##","replace":""},{"priority":4,"find":"#","replace":""}]',
  1,
  1
),
(
  'default02',
  'Fiverr Words',
  '[{"priority":1,"find":"email","replace":"em-ail"},{"priority":2,"find":"mail","replace":"ma-il"},{"priority":3,"find":"phone","replace":"pho-ne"},{"priority":4,"find":"whatsapp","replace":"whats-app"},{"priority":5,"find":"telegram","replace":"tele-gram"},{"priority":6,"find":"instagram","replace":"insta-gram"},{"priority":7,"find":"skype","replace":"sky-pe"},{"priority":8,"find":"discord","replace":"dis-cord"},{"priority":9,"find":"fiverr","replace":"fiv-err"}]',
  1,
  1
);

-- Seed empty notification alert row
INSERT OR IGNORE INTO notification_alert (id, enabled, heading, has_learn_more, body, version)
VALUES (1, 0, '', 0, '', 1);

-- Seed empty popup config row
INSERT OR IGNORE INTO popup_config (id, content, enabled, version) VALUES (1, '', 0, 1);

-- Seed empty about content row
INSERT OR IGNORE INTO about_content (id, html_content) VALUES (1, '');

