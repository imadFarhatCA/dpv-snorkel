-- Schedule rules: recurring patterns set by admins
CREATE TABLE IF NOT EXISTS schedule_rules (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL,              -- YYYY-MM-DD
  end_date   TEXT NOT NULL,              -- YYYY-MM-DD
  weekdays   TEXT NOT NULL DEFAULT '2,4', -- comma-separated: 0=Sun..6=Sat
  max_guests INTEGER NOT NULL DEFAULT 8,
  label      TEXT DEFAULT '',            -- e.g. "Summer 2026"
  active     INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Date overrides: open extra dates or cancel specific ones
CREATE TABLE IF NOT EXISTS date_overrides (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL UNIQUE,       -- YYYY-MM-DD
  action     TEXT NOT NULL,              -- 'open' or 'closed'
  max_guests INTEGER DEFAULT 8,          -- only used when action='open'
  reason     TEXT DEFAULT '',            -- e.g. "Bad weather", "Holiday special"
  created_at TEXT DEFAULT (datetime('now'))
);

-- Drop old trip_dates table (no longer needed)
DROP TABLE IF EXISTS trip_dates;

-- Seed: summer 2026 schedule — Tue & Thu, May through September
INSERT INTO schedule_rules (start_date, end_date, weekdays, max_guests, label) VALUES
  ('2026-05-01', '2026-09-30', '2,4', 8, 'Summer 2026');
