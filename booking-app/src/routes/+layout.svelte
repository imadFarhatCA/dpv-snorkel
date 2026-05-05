<script>
  import '../app.css';
  import { base } from '$app/paths';
  import { lang, setLang } from '$lib/lang.svelte.js';

  let { children } = $props();
</script>

<nav class="nav">
  <a href="https://www.sardiniasnorkeldpv.com" class="nav-logo" title="DPV Snorkel Experience">
    <img src="{base}/logo_base1.png" alt="Base One" />
  </a>
  <div class="nav-right">
    <a href="https://www.sardiniasnorkeldpv.com" class="nav-back">← Back to DPV</a>
    <div class="lang-toggle lang-toggle-nav" role="group" aria-label="Language">
      <button type="button" class="lang-btn" class:active={lang.value === 'en'} onclick={() => setLang('en')} aria-label="Switch to English">English</button>
      <button type="button" class="lang-btn" class:active={lang.value === 'it'} onclick={() => setLang('it')} aria-label="Passa all'italiano">Italiano</button>
    </div>
  </div>
</nav>

{@render children()}
