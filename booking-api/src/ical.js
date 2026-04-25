/**
 * iCalendar (.ics) generation.
 * Works for both individual booking confirmations and the team webcal feed.
 * Compatible with: iPhone Calendar, Google Calendar, Outlook, Apple Calendar.
 */

const LOCATION = 'Porto di Cala Gonone, Nuoro, Sardinia, Italy';
const ORGANIZER_EMAIL = 'info@baseone.it';
const ORGANIZER_NAME  = 'Base One';

function esc(str) {
  return String(str ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g,  '\\;')
    .replace(/,/g,  '\\,')
    .replace(/\n/g, '\\n');
}

function dateValue(dateStr) {
  // YYYY-MM-DD → YYYYMMDD (all-day)
  return dateStr.replace(/-/g, '');
}

function nextDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function stamp() {
  return new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
}

/** Single booking .ics — sent to the customer */
export function generateBookingIcs(booking) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Base One//DPV Snorkel Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}-${booking.ical_token}@baseone.it`,
    `DTSTAMP:${stamp()}`,
    `DTSTART;VALUE=DATE:${dateValue(booking.date)}`,
    `DTEND;VALUE=DATE:${nextDay(booking.date)}`,
    `SUMMARY:DPV Snorkel Experience — Base One Sardinia`,
    `DESCRIPTION:${esc(
      `Your DPV Snorkel Experience is confirmed!\n` +
      `\n` +
      `Date: ${booking.date}\n` +
      `Guests: ${booking.guests}\n` +
      `Meeting point: Porto di Cala Gonone\n` +
      `Arrive by: 08:30\n` +
      `\n` +
      `Total paid: €${booking.total_amount.toFixed(2)}\n` +
      `\n` +
      `Questions? WhatsApp or email info@baseone.it`
    )}`,
    `LOCATION:${esc(LOCATION)}`,
    `ORGANIZER;CN="${esc(ORGANIZER_NAME)}":mailto:${ORGANIZER_EMAIL}`,
    `ATTENDEE;CN="${esc(booking.name)}";RSVP=FALSE:mailto:${booking.email}`,
    `STATUS:CONFIRMED`,
    `SEQUENCE:0`,
    `TRANSP:OPAQUE`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}

/** Team webcal feed — all confirmed bookings, subscribe once, auto-updates */
export function generateFeedIcs(bookings) {
  const events = bookings.map(b => {
    const lines = [
      'BEGIN:VEVENT',
      `UID:booking-${b.id}@baseone.it`,
      `DTSTAMP:${stamp()}`,
      `DTSTART;VALUE=DATE:${dateValue(b.date)}`,
      `DTEND;VALUE=DATE:${nextDay(b.date)}`,
      `SUMMARY:DPV Trip · ${b.guests} pax · ${esc(b.name)}`,
      `DESCRIPTION:${esc(
        `Customer: ${b.name}\n` +
        `Email: ${b.email}\n` +
        `Phone: ${b.phone || 'N/A'}\n` +
        `Guests: ${b.guests}\n` +
        `Total paid: €${b.total_amount?.toFixed(2)}\n` +
        `Notes: ${b.notes || 'None'}`
      )}`,
      `LOCATION:${esc(LOCATION)}`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      'END:VEVENT',
    ];
    return lines.join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Base One//DPV Feed//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:DPV Trips — Base One',
    'X-WR-TIMEZONE:Europe/Rome',
    'X-WR-CALDESC:All confirmed DPV Snorkel bookings',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}
