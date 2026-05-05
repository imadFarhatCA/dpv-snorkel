const BOOKING_APP = 'https://base1dpv-book.pages.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = new URL(BOOKING_APP).hostname;
    url.protocol = 'https:';
    url.port = '';
    // keep /booking prefix — SvelteKit app is built with base: '/booking'

    const proxied = new Request(url.toString(), request);
    proxied.headers.set('host', new URL(BOOKING_APP).hostname);

    return fetch(proxied);
  },
};
