<script>
  import '../app.css';
  import { lang, toggleLang } from '$lib/lang.svelte.js';

  let { children } = $props();
</script>

<nav class="nav">
  <a href="https://dpv.baseone.it" class="nav-logo" title="DPV Snorkel Experience">
    <img src="/logo_base1.png" alt="Base One" />
  </a>
  <div class="nav-right">
    <a href="https://dpv.baseone.it" class="nav-back">← Back to DPV</a>
    <button class="btn-lang" onclick={toggleLang}>
      {lang.value === 'en' ? '🇮🇹 Italiano' : '🇬🇧 English'}
    </button>
  </div>
</nav>

{@render children()}
