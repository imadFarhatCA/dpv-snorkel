/**
 * DPV Booking Worker
 * Handles: available dates, Stripe checkout, booking confirmation,
 *          Stripe webhooks, iCal individual + webcal team feed.
 */

import { generateBookingIcs, generateFeedIcs } from './ical.js';

const PRICE_PER_PERSON = 90;
const MAX_GUESTS       = 8;
const DEPOSIT_PCT      = 0.5;

// ── CORS ────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://dpv.baseone.it',
  'https://www.baseone.it',
];

function cors(origin = '') {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

const json = (data, status = 200, origin = '') =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });

// ── Router ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url    = new URL(request.url);
    const path   = url.pathname;
    const origin = request.headers.get('origin') ?? '';

    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors(origin) });

    try {
      if (path === '/api/dates'  && request.method === 'GET')  return handleDates(env, origin);
      if (path === '/api/book'   && request.method === 'POST') return handleBook(request, env, url, origin);
      if (path === '/api/confirm'&& request.method === 'GET')  return handleConfirm(request, env, origin);
      if (path === '/api/stripe/webhook' && request.method === 'POST') return handleWebhook(request, env);

      // Team webcal feed  — webcal://worker-url/calendar/feed.ics?token=xxx
      if (path === '/calendar/feed.ics') return handleFeed(request, env);

      // Individual booking .ics — /calendar/TOKEN.ics
      const m = path.match(/^\/calendar\/([a-zA-Z0-9]+)\.ics$/);
      if (m) return handleBookingIcs(m[1], env);

      return new Response('Not found', { status: 404 });
    } catch (err) {
      console.error(err);
      return json({ error: 'Internal server error' }, 500, origin);
    }
  },
};

// ── GET /api/dates ───────────────────────────────────────────────────────────

async function handleDates(env, origin) {
  const today  = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.now() + 180 * 86400_000).toISOString().slice(0, 10);

  const { results } = await env.DB.prepare(`
    SELECT
      t.date,
      COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.guests ELSE 0 END), 0) AS booked
    FROM trip_dates t
    LEFT JOIN bookings b ON b.date = t.date
    WHERE t.active = 1 AND t.date >= ? AND t.date <= ?
    GROUP BY t.date
    ORDER BY t.date ASC
  `).bind(today, cutoff).all();

  const dates = results
    .map(r => ({ date: r.date, spots_left: MAX_GUESTS - r.booked }))
    .filter(r => r.spots_left > 0);

  return json({ dates }, 200, origin);
}

// ── POST /api/book ───────────────────────────────────────────────────────────

async function handleBook(request, env, url, origin) {
  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400, origin); }

  const { date, name, email, phone = '', guests = 1, lang = 'en', notes = '' } = body;

  // Validation
  if (!date || !name?.trim() || !email?.trim())
    return json({ error: 'date, name and email are required' }, 400, origin);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return json({ error: 'Invalid email address' }, 400, origin);
  if (!Number.isInteger(guests) || guests < 1 || guests > MAX_GUESTS)
    return json({ error: `Guests must be between 1 and ${MAX_GUESTS}` }, 400, origin);
  if (name.length > 120 || notes.length > 600)
    return json({ error: 'Input too long' }, 400, origin);

  // Check availability
  const { results: check } = await env.DB.prepare(`
    SELECT t.date,
      COALESCE(SUM(CASE WHEN b.status = 'confirmed' THEN b.guests ELSE 0 END), 0) AS booked
    FROM trip_dates t
    LEFT JOIN bookings b ON b.date = t.date
    WHERE t.active = 1 AND t.date = ?
    GROUP BY t.date
  `).bind(date).all();

  if (!check.length)
    return json({ error: 'Date not available' }, 400, origin);

  const spotsLeft = MAX_GUESTS - check[0].booked;
  if (guests > spotsLeft)
    return json({ error: `Only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left for this date` }, 400, origin);

  const totalAmount   = guests * PRICE_PER_PERSON;
  const depositAmount = totalAmount * DEPOSIT_PCT;
  const icalToken     = crypto.randomUUID().replace(/-/g, '');

  // Create pending booking
  const { meta } = await env.DB.prepare(`
    INSERT INTO bookings (date, name, email, phone, guests, total_amount, deposit_amount, ical_token, lang, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    date, name.trim(), email.trim().toLowerCase(),
    phone.trim(), guests, totalAmount, depositAmount,
    icalToken, lang, notes.trim()
  ).run();

  const bookingId = meta.last_row_id;

  // Create Stripe Checkout session
  const siteUrl = env.SITE_URL ?? 'http://localhost:8080';
  const session = await createStripeSession({ env, bookingId, date, name, email, guests, depositAmount, totalAmount, siteUrl });

  if (!session?.id)
    return json({ error: 'Could not create payment session' }, 502, origin);

  await env.DB.prepare(`UPDATE bookings SET stripe_session_id = ? WHERE id = ?`)
    .bind(session.id, bookingId).run();

  return json({ url: session.url, session_id: session.id }, 200, origin);
}

// ── GET /api/confirm ─────────────────────────────────────────────────────────

async function handleConfirm(request, env, origin) {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) return json({ error: 'Missing session_id' }, 400, origin);

  // Verify with Stripe
  const session = await stripeGet(env, `checkout/sessions/${sessionId}`);
  if (!session?.id) return json({ error: 'Session not found' }, 404, origin);
  if (session.payment_status !== 'paid')
    return json({ error: 'Payment not completed' }, 402, origin);

  // Confirm booking (idempotent — safe to call multiple times)
  await env.DB.prepare(`
    UPDATE bookings
    SET status = 'confirmed', stripe_payment_intent = ?
    WHERE stripe_session_id = ? AND status = 'pending'
  `).bind(session.payment_intent ?? '', sessionId).run();

  const { results } = await env.DB.prepare(
    `SELECT * FROM bookings WHERE stripe_session_id = ?`
  ).bind(sessionId).all();

  return json({ booking: results[0] ?? null }, 200, origin);
}

// ── POST /api/stripe/webhook ─────────────────────────────────────────────────

async function handleWebhook(request, env) {
  const payload = await request.text();
  const sig     = request.headers.get('stripe-signature') ?? '';

  if (!await verifyStripeWebhook(payload, sig, env.STRIPE_WEBHOOK_SECRET))
    return new Response('Unauthorized', { status: 401 });

  let event;
  try { event = JSON.parse(payload); }
  catch { return new Response('Bad Request', { status: 400 }); }

  const sid = event.data?.object?.id ?? '';

  if (event.type === 'checkout.session.completed') {
    await env.DB.prepare(`
      UPDATE bookings SET status = 'confirmed', stripe_payment_intent = ?
      WHERE stripe_session_id = ? AND status = 'pending'
    `).bind(event.data.object.payment_intent ?? '', sid).run();
  }

  if (event.type === 'checkout.session.expired') {
    await env.DB.prepare(`
      UPDATE bookings SET status = 'cancelled'
      WHERE stripe_session_id = ? AND status = 'pending'
    `).bind(sid).run();
  }

  return new Response('OK', { status: 200 });
}

// ── GET /calendar/feed.ics ────────────────────────────────────────────────────

async function handleFeed(request, env) {
  const token = new URL(request.url).searchParams.get('token');
  if (env.WEBCAL_SECRET && token !== env.WEBCAL_SECRET)
    return new Response('Unauthorized — add ?token=YOUR_SECRET to subscribe', { status: 401 });

  const { results } = await env.DB.prepare(
    `SELECT * FROM bookings WHERE status = 'confirmed' ORDER BY date ASC`
  ).all();

  return new Response(generateFeedIcs(results), {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Cache-Control':       'no-cache, no-store',
      'Content-Disposition': 'inline; filename="dpv-trips.ics"',
    },
  });
}

// ── GET /calendar/:token.ics ──────────────────────────────────────────────────

async function handleBookingIcs(token, env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM bookings WHERE ical_token = ? AND status = 'confirmed'`
  ).bind(token).all();

  if (!results.length) return new Response('Not found', { status: 404 });

  const booking = results[0];
  return new Response(generateBookingIcs(booking), {
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="dpv-trip-${booking.date}.ics"`,
    },
  });
}

// ── Stripe helpers ────────────────────────────────────────────────────────────

function stripeSignal(ms = 10000) {
  return AbortSignal.timeout ? AbortSignal.timeout(ms) : undefined;
}

async function stripeGet(env, endpoint) {
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}` },
    signal: stripeSignal(),
  });
  return res.json();
}

async function stripePost(env, endpoint, params) {
  const res = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization':  `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type':   'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
    signal: stripeSignal(),
  });
  return res.json();
}

async function createStripeSession({ env, bookingId, date, name, email, guests, depositAmount, totalAmount, siteUrl }) {
  const depositCents = Math.round(depositAmount * 100);

  return stripePost(env, 'checkout/sessions', {
    mode:                                                  'payment',
    customer_email:                                        email,
    'line_items[0][price_data][currency]':                 'eur',
    'line_items[0][price_data][product_data][name]':       `DPV Snorkel Experience — ${date}`,
    'line_items[0][price_data][product_data][description]':
      `${guests} guest${guests > 1 ? 's' : ''} · 50% deposit (balance €${(totalAmount * 0.5).toFixed(2)} due on the day)`,
    'line_items[0][price_data][unit_amount]':              depositCents,
    'line_items[0][quantity]':                             '1',
    'metadata[booking_id]':                               bookingId,
    'metadata[date]':                                     date,
    'metadata[guests]':                                   guests,
    success_url: `${siteUrl}/booking-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${siteUrl}/book.html?cancelled=1`,
    expires_at:  Math.floor(Date.now() / 1000) + 1800,  // 30 min window
  });
}

async function verifyStripeWebhook(payload, sigHeader, secret) {
  if (!secret || !sigHeader) return !secret; // skip verification if no secret set (dev)
  const tPart  = sigHeader.split(',').find(p => p.startsWith('t='));
  const v1Part = sigHeader.split(',').find(p => p.startsWith('v1='));
  if (!tPart || !v1Part) return false;

  const signed   = `${tPart.slice(2)}.${payload}`;
  const key      = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac      = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  const received = v1Part.slice(3);

  if (received.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < received.length; i++) diff |= received.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
