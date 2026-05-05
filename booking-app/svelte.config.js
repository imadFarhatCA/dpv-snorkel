import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    alias: { $lib: 'src/lib' },
    paths: { base: '/booking' },
  },
};

export default config;
