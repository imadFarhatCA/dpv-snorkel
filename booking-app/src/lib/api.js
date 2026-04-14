/** Booking Worker base URL — auto-detects dev vs prod */
export const API =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8789'
    : 'https://dpv-booking.baseone.workers.dev';

/** Fetch with a timeout (default 15 s). Throws on timeout or network error. */
export async function fetchWithTimeout(url, options = {}, ms = 15000) {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(tid);
  }
}
