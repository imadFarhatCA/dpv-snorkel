// Single source of truth for runtime config.
// Loaded synchronously (no defer) so inline scripts can use window.DPV_CONFIG.
window.DPV_CONFIG = (function () {
  const h = location.hostname;
  const isLocal = h === 'localhost' || h === '127.0.0.1';

  return {
    API: isLocal
      ? 'http://localhost:8789'
      : 'https://dpv-booking.baseone.workers.dev',

    BOOK_URL:     'https://base1dpv-book.pages.dev/book',
    BASEONE_URL:  'https://www.baseone.it',
    WHATSAPP_URL: 'https://wa.me/message/BASEONE',
    CONTACT_EMAIL: 'info@baseone.it',

    PRICE_PER_PERSON: 90,
    PRICE_ORIGINAL:   120,
    MAX_GUESTS:       8,
    MEETING_POINT:    'Base1 Sardinia · Viale Colombo 15, Cala Gonone',
    ARRIVAL_TIME:     '08:30',
  };
})();
