-- DPV Booking — D1 Schema

-- Trip dates managed by admin (backoffice)
CREATE TABLE IF NOT EXISTS trip_dates (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  date       TEXT NOT NULL UNIQUE,   -- YYYY-MM-DD
  active     INTEGER DEFAULT 1,      -- 0 = disabled by admin
  created_at TEXT DEFAULT (datetime('now'))
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  date                  TEXT NOT NULL,
  name                  TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT DEFAULT '',
  guests                INTEGER NOT NULL DEFAULT 1,
  total_amount          REAL NOT NULL,       -- guests × 90
  deposit_amount        REAL NOT NULL,       -- 50% paid via Stripe
  stripe_session_id     TEXT DEFAULT '',
  stripe_payment_intent TEXT DEFAULT '',
  ical_token            TEXT NOT NULL UNIQUE, -- random token for .ics URL
  status                TEXT DEFAULT 'pending', -- pending | confirmed | cancelled
  lang                  TEXT DEFAULT 'en',
  notes                 TEXT DEFAULT '',
  created_at            TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_date   ON bookings(date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_email  ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_token  ON bookings(ical_token);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe ON bookings(stripe_session_id);

-- Seed upcoming Tuesdays and Thursdays for local dev testing
-- weekday 2 = Tuesday, weekday 4 = Thursday
INSERT OR IGNORE INTO trip_dates (date) VALUES
  (date('now', 'weekday 2')),
  (date('now', 'weekday 4')),
  (date('now', '+7 days', 'weekday 2')),
  (date('now', '+7 days', 'weekday 4')),
  (date('now', '+14 days', 'weekday 2')),
  (date('now', '+14 days', 'weekday 4')),
  (date('now', '+21 days', 'weekday 2')),
  (date('now', '+21 days', 'weekday 4'));
