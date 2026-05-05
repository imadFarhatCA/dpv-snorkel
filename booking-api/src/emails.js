/**
 * DPV Booking — Email templates
 * Shared email layout, confirmation, and reschedule templates.
 */

import { BRAND, MEETING_POINT as MEETING, MAPS_URL, SITE_URL_MAIN, BOOKING_EMAIL, REPLY_TO_EMAIL } from './config.js';
const FROM = `Base One Sardinia <${BOOKING_EMAIL}>`;

// ── Helpers ──────────────────────────────────────────────────────────────────

function t(lang, en, it) { return lang === 'it' ? it : en; }

function row(label, value, style = '') {
  return `<tr><td style="padding:8px 0;color:#6b7280">${label}</td><td style="padding:8px 0;text-align:right;font-weight:600;${style}">${value}</td></tr>`;
}

function bookingRows(b) {
  const lang = b.lang;
  return [
    row(t(lang, 'Name', 'Nome'), b.name),
    row(t(lang, 'Date', 'Data'), b.date, `color:${BRAND.color}`),
    row(t(lang, 'Time', 'Ora'), '14:00 (2 PM)', `color:${BRAND.color}`),
    row(t(lang, 'Guests', 'Ospiti'), b.guests),
    row(t(lang, 'Meeting point', 'Punto di ritrovo'), MEETING),
    `<tr style="border-top:1px solid #e5e7eb">${row(t(lang, 'Total paid ✓', 'Totale pagato ✓'), `€${b.total_amount.toFixed(2)}`, `color:${BRAND.green}`).slice(4)}`,
  ].join('');
}

// ── Layout shell ─────────────────────────────────────────────────────────────

function emailShell(heading, subtitle, body, lang) {
  return `<div style="font-family:'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;color:#2c2c2c">
  <div style="background:${BRAND.dark};padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;font-size:22px;margin:0 0 6px">${heading}</h1>
    <p style="color:rgba(255,255,255,.6);font-size:14px;margin:0">${subtitle}</p>
  </div>
  ${body}
  <div style="padding:20px 24px;text-align:center;font-size:12px;color:#6b7280;border-radius:0 0 12px 12px">
    <p style="margin:0">${MEETING}</p>
    <p style="margin:4px 0 0">
      <a href="https://wa.me/393403430380" style="color:${BRAND.color}">WhatsApp</a> ·
      <a href="${SITE_URL_MAIN}" style="color:${BRAND.color}">Website</a>
    </p>
  </div>
</div>`;
}

function btn(href, label, outline = false) {
  return outline
    ? `<a href="${href}" style="display:inline-block;padding:10px 24px;border:2px solid ${BRAND.color};color:${BRAND.color};border-radius:8px;font-weight:700;font-size:13px;text-decoration:none">${label}</a>`
    : `<a href="${href}" style="display:inline-block;padding:12px 28px;background:${BRAND.color};color:#fff;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none">${label}</a>`;
}

function paidNote(b) {
  return `<p style="font-size:13px;color:${BRAND.green};background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin:0 0 16px">
    ✅ ${t(b.lang, `Your payment of <strong>€${b.total_amount.toFixed(2)}</strong> has been received. Nothing to pay on the day.`, `Il pagamento di <strong>€${b.total_amount.toFixed(2)}</strong> è stato ricevuto. Nulla da pagare il giorno dell'attività.`)}
  </p>`;
}

function mapsLink(lang) {
  return `<p style="font-size:13px;color:#6b7280;margin:0 0 16px">📍 <a href="${MAPS_URL}" style="color:${BRAND.color}">${t(lang, 'Open in Google Maps', 'Apri in Google Maps')}</a></p>`;
}

// ── Confirmation email ───────────────────────────────────────────────────────

export function confirmationEmail(booking, siteUrl) {
  const lang = booking.lang;
  const body = `
  <div style="background:#f9fafb;padding:28px 24px;border:1px solid #e5e7eb;border-top:none">
    <table style="width:100%;border-collapse:collapse;font-size:14px">${bookingRows(booking)}</table>
  </div>
  <div style="padding:20px 24px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    ${paidNote(booking)}
    ${mapsLink(lang)}
    <div style="text-align:center;margin:20px 0">
      ${btn(`${siteUrl}/booking-success?session_id=${booking.stripe_session_id}`, t(lang, 'View Booking', 'Vedi Prenotazione'))}
    </div>
    <div style="text-align:center;margin:16px 0">
      ${btn(`${SITE_URL_MAIN}/waiver.html?token=${booking.ical_token}`, t(lang, 'Fill Liability Waiver', 'Compila la Liberatoria'), true)}
    </div>
  </div>`;

  return {
    subject: t(lang, `Booking Confirmed — DPV Snorkel ${booking.date}`, `Prenotazione Confermata — DPV Snorkel ${booking.date}`),
    html: emailShell(
      t(lang, 'Booking Confirmed!', 'Prenotazione Confermata!'),
      t(lang, 'Your payment has been received.', 'Il tuo pagamento è stato ricevuto.'),
      body, lang
    )
  };
}

// ── Reschedule email ─────────────────────────────────────────────────────────

export function rescheduleEmail(booking, oldDate, apiUrl) {
  const lang = booking.lang;
  const newFmt = new Date(booking.date + 'T12:00:00Z').toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const oldFmt = new Date(oldDate + 'T12:00:00Z').toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const dateStr = booking.date.replace(/-/g, '');
  const gcUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('DPV Snorkel Experience — Base One')}&dates=${dateStr}T120000Z/${dateStr}T160000Z&details=${encodeURIComponent(`Guests: ${booking.guests}\nMeeting point: ${MEETING}\nTime: 2:00 PM`)}&location=${encodeURIComponent(MEETING + ', Sardinia, Italy')}`;
  const icsUrl = `${apiUrl}/calendar/${booking.ical_token}.ics`;

  const body = `
  <div style="background:#fff7ed;padding:14px 24px;border-left:4px solid #f59e0b;font-size:14px;color:#92400e;">
    ${t(lang,
      `<strong>Previous date:</strong> ${oldFmt} → <strong>New date:</strong> ${newFmt}`,
      `<strong>Data precedente:</strong> ${oldFmt} → <strong>Nuova data:</strong> ${newFmt}`)}
  </div>
  <div style="background:#f9fafb;padding:28px 24px;border:1px solid #e5e7eb;border-top:none">
    <table style="width:100%;border-collapse:collapse;font-size:14px">${bookingRows(booking)}</table>
  </div>
  <div style="padding:20px 24px;background:#fff;border:1px solid #e5e7eb;border-top:none">
    <p style="font-size:13px;color:#6b7280;margin:0 0 16px">${t(lang, 'Update your calendar with the new date:', 'Aggiorna il tuo calendario con la nuova data:')}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${btn(icsUrl, t(lang, 'Download .ics (iPhone/iCal)', 'Scarica .ics (iPhone/iCal)'))}
      ${btn(gcUrl, t(lang, 'Add to Google Calendar', 'Aggiungi a Google Calendar'), true)}
    </div>
  </div>`;

  return {
    subject: t(lang, `Booking Rescheduled — DPV Snorkel ${booking.date}`, `Prenotazione Riprogrammata — DPV Snorkel ${booking.date}`),
    html: emailShell(
      t(lang, 'Booking Rescheduled', 'Prenotazione Riprogrammata'),
      t(lang, 'Your booking has been moved to a new date.', 'La tua prenotazione è stata spostata a una nuova data.'),
      body, lang
    )
  };
}

// ── Send via Resend ──────────────────────────────────────────────────────────

export async function sendEmail(env, to, name, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [name ? `${name} <${to}>` : to],
      reply_to: REPLY_TO_EMAIL,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const data = await res.text();
    console.error('Resend error', res.status, data);
  }
  return res;
}
