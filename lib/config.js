// Single source of truth for runtime config.
// Loaded synchronously (no defer) so inline scripts can use window.DPV_CONFIG.
window.DPV_CONFIG = (function () {
  const h = location.hostname;
  const isLocal = h === 'localhost' || h === '127.0.0.1';

  return {
    API: isLocal
      ? 'http://localhost:8789'
      : 'https://dpv-booking.baseone.workers.dev',

    BOOK_URL:      'https://www.sardiniasnorkeldpv.com/booking/book',
    BASEONE_URL:   'https://www.baseone.it',
    WHATSAPP_URL:  'https://wa.me/393403430380',
    CONTACT_EMAIL: 'info@baseone.it',
    BOOKING_EMAIL: 'booking@baseone.it',
    MAPS_URL:      'https://www.google.com/maps/search/Base1+Sardinia+Viale+Colombo+15+Cala+Gonone',

    PRICE_PER_PERSON: 90,
    PRICE_ORIGINAL:   120,
    MAX_GUESTS:       8,

    MEETING_POINT:      'Base1 Sardinia · Viale Colombo 15, Cala Gonone',
    MEETING_POINT_LONG: 'Base1 Sardinia, Viale Colombo 15, Cala Gonone, Nuoro, Sardinia, Italy',
    ICAL_LOCATION:      'Porto di Cala Gonone, Nuoro, Sardinia, Italy',
    ARRIVAL_TIME:       '08:30',

    BRAND_COLOR: '#0693e3',
    BRAND_DARK:  '#101820',
    BRAND_GREEN: '#16a34a',
    BRAND_WARN:  '#92400e',
  };
})();
