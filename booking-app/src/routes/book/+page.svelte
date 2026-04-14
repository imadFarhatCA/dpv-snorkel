<script>
  import { onMount } from 'svelte';
  import { lang, t } from '$lib/lang.svelte.js';
  import { API, fetchWithTimeout } from '$lib/api.js';
  import fp from 'flatpickr';
  import 'flatpickr/dist/flatpickr.min.css';
  const flatpickr = fp.default ?? fp;

  // ── Helpers ──────────────────────────────────────
  function toKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // ── State ────────────────────────────────────────
  let step          = $state(1);
  let _dates        = {};             // plain object for flatpickr (no proxy)
  let availableDates= $state({});     // reactive copy for UI
  let selectedDate  = $state(null);
  let guestCount    = $state(1);
  let alertMsg      = $state('');
  let alertType     = $state('');
  let submitting    = $state(false);
  let fpInstance    = null;

  // ── Form fields ──────────────────────────────────
  let name  = $state('');
  let email = $state('');
  let phone = $state('');

  // ── Derived ──────────────────────────────────────
  let spotsLeft = $derived(selectedDate ? (availableDates[selectedDate] ?? 0) : 0);
  let total     = $derived(guestCount * 90);
  let deposit   = $derived(total * 0.5);
  let balance   = $derived(total * 0.5);

  let chipDate = $derived.by(() => {
    if (!selectedDate) return '—';
    const d    = new Date(selectedDate + 'T12:00:00Z');
    const days = lang.value === 'en'
      ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      : ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return lang.value === 'en'
      ? `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}`
      : `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
  });

  let payLabel = $derived(
    t(`Pay Deposit — €${deposit}`, `Paga Deposito — €${deposit}`)
  );

  // ── Flatpickr ────────────────────────────────────
  function markAvailable(inst) {
    inst.calendarContainer.querySelectorAll('.flatpickr-day.available')
      .forEach(el => el.classList.remove('available'));
    inst.calendarContainer
      .querySelectorAll('.flatpickr-day:not(.flatpickr-disabled):not(.prevMonthDay):not(.nextMonthDay)')
      .forEach(el => el.classList.add('available'));
  }

  function initCalendar() {
    const el = document.getElementById('fp-calendar');
    if (!el || fpInstance) return;
    fpInstance = flatpickr(el, {
      inline:     true,
      minDate:    'today',
      dateFormat: 'Y-m-d',
      locale:     { firstDayOfWeek: 1 },
      disable: [date => !_dates[toKey(date)]],
      onReady(_, __, inst)       { setTimeout(() => markAvailable(inst), 50); },
      onMonthChange(_, __, inst) { setTimeout(() => markAvailable(inst), 50); },
      onChange(selected) {
        if (!selected.length) return;
        selectedDate = toKey(selected[0]);
        guestCount   = 1;
        setTimeout(() => { step = 2; }, 320);
      },
    });
  }

  // ── Step nav ─────────────────────────────────────
  function goToStep1() {
    step = 1;
    // Re-apply highlights after the step becomes visible
    setTimeout(() => fpInstance && markAvailable(fpInstance), 50);
  }

  // ── Guest counter ─────────────────────────────────
  function changeGuests(delta) {
    guestCount = Math.max(1, Math.min(spotsLeft, guestCount + delta));
  }

  // ── Submit ────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    alertMsg = '';
    if (!name.trim())  return showAlert(t('Please enter your name.',  'Inserisci il tuo nome.'),  'error');
    if (!email.trim()) return showAlert(t('Please enter your email.', 'Inserisci la tua email.'), 'error');

    submitting = true;
    try {
      const res  = await fetchWithTimeout(`${API}/api/book`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ date: selectedDate, name: name.trim(), email: email.trim(), phone: phone.trim(), guests: guestCount, lang: lang.value, notes: '' }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        showAlert(data.error ?? t('Something went wrong. Please try again.', 'Qualcosa è andato storto. Riprova.'), 'error');
        submitting = false;
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      showAlert(
        err.name === 'AbortError'
          ? t('Request timed out. Please try again.', 'Richiesta scaduta. Riprova.')
          : t('Network error. Please try again.',     'Errore di rete. Riprova.'),
        'error'
      );
      submitting = false;
    }
  }

  function showAlert(msg, type) { alertMsg = msg; alertType = type; }

  // ── Init ──────────────────────────────────────────
  onMount(async () => {
    if (new URLSearchParams(location.search).get('cancelled') === '1') {
      step = 2;
      showAlert(t('Payment cancelled. No charge was made.', 'Pagamento annullato. Nessun addebito.'), 'info');
    }

    // Load dates, then init calendar
    try {
      const res  = await fetch(`${API}/api/dates`);
      const data = await res.json();
      _dates = Object.fromEntries(data.dates.map(d => [d.date, d.spots_left]));
      availableDates = _dates;
      console.log('[DPV] Loaded dates:', Object.keys(_dates).length, 'first:', Object.keys(_dates)[0]);
    } catch (err) {
      console.error('[DPV] Failed to load dates:', err);
      showAlert(t('Could not load available dates. Please refresh.', 'Impossibile caricare le date. Ricarica la pagina.'), 'error');
    }

    const el = document.getElementById('fp-calendar');
    console.log('[DPV] Calendar element:', el ? 'found' : 'NOT FOUND');
    console.log('[DPV] _dates sample:', JSON.stringify(_dates).slice(0, 100));
    initCalendar();
  });
</script>

<svelte:head>
  <title>{t('Book', 'Prenota')} — DPV Snorkel · Base One Sardinia</title>
</svelte:head>

<div class="book-page">

  <!-- Step header -->
  <div class="step-header">
    <p class="step-title">{t('Book Your', 'Prenota la tua')} <span>{t('DPV Snorkel', 'Esperienza DPV')}</span> {t('Experience', '')}</p>
    <div class="step-bar">
      <div class="step-dot" class:active={step === 1} class:done={step > 1}>
        <div class="step-dot-circle">
          {#if step > 1}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          {:else}1{/if}
        </div>
        <div class="step-dot-label">{t('Date', 'Data')}</div>
      </div>
      <div class="step-connector" class:done={step > 1}></div>
      <div class="step-dot" class:active={step === 2}>
        <div class="step-dot-circle">2</div>
        <div class="step-dot-label">{t('Details', 'Dettagli')}</div>
      </div>
      <div class="step-connector"></div>
      <div class="step-dot" class:active={step === 3}>
        <div class="step-dot-circle">3</div>
        <div class="step-dot-label">{t('Payment', 'Pagamento')}</div>
      </div>
    </div>
  </div>

  <div class="book-body">

    <!-- ── STEP 1: Pick a date (always in DOM, hidden via CSS) ── -->
    <div class="step-panel" class:hidden={step !== 1}>
      <div class="book-card">
        <div class="card-head">
          <span class="card-head-title">{t('Select a Date', 'Scegli una Data')}</span>
          <span class="card-head-meta">€90 / {t('person', 'persona')} · max 8</span>
        </div>
        <div class="card-body" style="padding-bottom:0">
          <div id="fp-calendar"></div>
        </div>
        {#if selectedDate && step === 1}
          <div class="spots-row">
            <div class="spots-badge" class:low={spotsLeft <= 2}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {spotsLeft} {t(`spot${spotsLeft === 1 ? '' : 's'} left`, `posto${spotsLeft === 1 ? '' : 'i'} disponibile${spotsLeft === 1 ? '' : 'i'}`)}
            </div>
          </div>
        {/if}
      </div>

      <!-- What's included -->
      <div class="book-card" style="margin-top:16px">
        <div class="card-head">
          <span class="card-head-title">{t("What's Included", 'Cosa Include')}</span>
        </div>
        <div class="card-body">
          <div class="included-list">
            {#each [
              { en: 'DPV (underwater scooter)', it: 'Scooter subacqueo DPV', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 8v4l3 3' },
              { en: 'Safety equipment',         it: 'Attrezzatura sicurezza', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
              { en: 'Guide in the water',        it: 'Guida in acqua',         icon: 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2' },
              { en: 'Small group (max 8)',        it: 'Piccolo gruppo (max 8)', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
            ] as item}
              <div class="included-item">
                <div class="included-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d={item.icon}/></svg>
                </div>
                {t(item.en, item.it)}
              </div>
            {/each}
          </div>
          <p class="included-note">
            📍 {t('Meeting point: Porto di Cala Gonone · Arrive by 08:30', 'Punto di ritrovo: Porto di Cala Gonone · Arrivo entro le 08:30')}
          </p>
        </div>
      </div>
    </div>

    <!-- ── STEP 2: Details + payment ── -->
    <div class="step-panel" class:hidden={step !== 2}>

      <!-- Date chip -->
      <div class="date-chip">
        <div class="date-chip-left">
          <div class="date-chip-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div class="date-chip-date">{chipDate}</div>
            <div class="date-chip-sub">{selectedDate?.slice(0,4)} · Porto di Cala Gonone · 08:30</div>
          </div>
        </div>
        <button class="date-chip-change" onclick={goToStep1}>
          {t('Change date', 'Cambia data')}
        </button>
      </div>

      <!-- Guests -->
      <div class="book-card">
        <div class="card-head">
          <span class="card-head-title">{t('Number of Guests', 'Numero di Ospiti')}</span>
          <span class="card-head-meta">{spotsLeft} {t('spots left', 'posti disponibili')}</span>
        </div>
        <div class="card-body">
          <div class="guest-counter">
            <div>
              <div class="guest-label">{t('Guests', 'Ospiti')}</div>
              <div class="guest-sub">€90 {t('per person', 'a persona')}</div>
            </div>
            <div class="guest-controls">
              <button class="guest-btn" onclick={() => changeGuests(-1)} disabled={guestCount <= 1} aria-label={t('Remove guest','Rimuovi ospite')}>−</button>
              <span class="guest-count" aria-live="polite">{guestCount}</span>
              <button class="guest-btn" onclick={() => changeGuests(1)}  disabled={guestCount >= spotsLeft} aria-label={t('Add guest','Aggiungi ospite')}>+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Details form -->
      <div class="book-card" style="margin-top:16px">
        <div class="card-head">
          <span class="card-head-title">{t('Your Details', 'I Tuoi Dati')}</span>
        </div>
        <div class="card-body">

          {#if alertMsg}
            <div class="alert {alertType}">{alertMsg}</div>
          {/if}

          <form onsubmit={handleSubmit} novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="name">{t('Full Name *', 'Nome Completo *')}</label>
                <input type="text" id="name" bind:value={name} autocomplete="name" maxlength="120" placeholder="Mario Rossi" required />
              </div>
              <div class="form-group">
                <label for="phone">{t('Phone', 'Telefono')}</label>
                <input type="tel" id="phone" bind:value={phone} autocomplete="tel" placeholder="+39 333 000 0000" />
              </div>
            </div>
            <div class="form-group">
              <label for="email">{t('Email *', 'Email *')}</label>
              <input type="email" id="email" bind:value={email} autocomplete="email" required placeholder="mario@example.com" />
            </div>

            <!-- Price summary -->
            <div class="price-summary">
              <div class="price-row"><span class="price-label">{t('Price per person','Prezzo a persona')}</span><span>€90</span></div>
              <div class="price-row"><span class="price-label">{t('Guests','Ospiti')}</span><span>{guestCount}</span></div>
              <div class="price-row total"><span>{t('Total','Totale')}</span><span>€{total}</span></div>
              <div class="price-row deposit"><span>⚡ {t('Deposit due today (50%)','Deposito oggi (50%)')}</span><span>€{deposit}</span></div>
              <div class="price-row"><span class="price-label">{t('Balance on the day','Saldo il giorno')}</span><span>€{balance}</span></div>
            </div>

            <button type="submit" class="btn-pay" disabled={submitting}>
              {#if submitting}
                <span class="spinner"></span> {t('Redirecting to Stripe…','Reindirizzamento a Stripe…')}
              {:else}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                {payLabel}
              {/if}
            </button>
            <p class="pay-note">{t('Secure payment via Stripe · Redirected to complete deposit','Pagamento sicuro via Stripe · Reindirizzato per il deposito')}</p>
          </form>
        </div>
      </div>
    </div>

  </div>
</div>

<style>
  /* ── Page ── */
  .book-page  { min-height: 100vh; background: var(--book-bg); padding-top: var(--nav-h); }
  .book-body  { max-width: 440px; margin: 0 auto; padding: 32px 16px 80px; }

  /* ── Step panels ── */
  .step-panel.hidden { display: none; }

  /* ── Step header ── */
  .step-header {
    background: var(--book-dk);
    padding: 40px 24px 40px;
    display: flex; flex-direction: column; align-items: center;
  }
  .step-title {
    color: #fff; font-size: clamp(1.1rem,3vw,1.5rem); font-weight: 700;
    margin-bottom: 36px; text-align: center;
  }
  .step-title span { color: var(--color-ocean); }

  .step-bar {
    display: flex; align-items: flex-start;
    width: 100%; max-width: 420px; justify-content: center;
  }
  .step-dot { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .step-dot-circle {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: .8rem; font-weight: 700;
    background: rgba(255,255,255,.15); color: rgba(255,255,255,.5);
    border: 2px solid rgba(255,255,255,.2);
    transition: background .3s, border-color .3s;
  }
  .step-dot.active .step-dot-circle { background: var(--color-ocean); color:#fff; border-color: var(--color-ocean); }
  .step-dot.done   .step-dot-circle { background: var(--book-green); color:#fff; border-color: var(--book-green); }
  .step-dot-label  { font-size:.7rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.4); }
  .step-dot.active .step-dot-label,
  .step-dot.done   .step-dot-label  { color: rgba(255,255,255,.8); }
  .step-connector  { flex:1; height:2px; background:rgba(255,255,255,.15); margin:15px 12px 0; min-width:20px; transition:background .3s; }
  .step-connector.done { background: var(--book-green); }

  /* ── Card ── */
  .book-card { background:var(--color-bg); border-radius:var(--book-r-card); box-shadow:0 2px 12px rgba(0,0,0,.07); overflow:hidden; }
  .book-card + .book-card { margin-top:16px; }
  .card-head { padding:16px 24px; border-bottom:1px solid var(--color-border); display:flex; align-items:center; justify-content:space-between; }
  .card-head-title { font-size:.72rem; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--color-muted); }
  .card-head-meta  { font-size:.78rem; color:var(--color-muted); }
  .card-body { padding:24px; }

  /* ── Flatpickr ── */
  :global(.flatpickr-calendar.inline) {
    width:100% !important; max-width:100% !important;
    box-shadow:none !important; border:none !important; background:transparent !important;
  }
  :global(.flatpickr-rContainer),
  :global(.flatpickr-days),
  :global(.dayContainer) { width:100% !important; min-width:100% !important; max-width:100% !important; }
  :global(.flatpickr-day) {
    max-width:none !important; flex:1 1 14.28% !important;
    border-radius:var(--book-r) !important; height:42px !important; line-height:42px !important;
  }
  :global(.flatpickr-months) {
    background:var(--book-dk); border-radius:var(--book-r-card); padding:8px; margin-bottom:12px;
  }
  :global(.flatpickr-month) {
    background:transparent !important; color:#fff !important; fill:#fff !important;
    height:auto !important; display:flex !important; align-items:center !important;
    flex:1 !important; overflow:visible !important;
  }
  :global(.flatpickr-current-month) {
    position:static !important; left:auto !important; width:100% !important; padding:0 !important;
    display:flex !important; align-items:center !important; justify-content:space-between !important; gap:8px !important;
  }
  :global(.flatpickr-current-month .flatpickr-monthDropdown-months) {
    appearance:none !important; -webkit-appearance:none !important;
    background-color:var(--book-pill) !important; border:none !important; border-radius:var(--book-r) !important;
    color:#fff !important; font-family:var(--font) !important; font-size:1.05rem !important; font-weight:700 !important;
    padding:10px 34px 10px 14px !important; flex:1 !important; cursor:pointer !important;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") !important;
    background-repeat:no-repeat !important; background-position:right 11px center !important;
    transition:background-color .15s !important;
  }
  :global(.flatpickr-current-month .flatpickr-monthDropdown-months:hover) { background-color:var(--book-pill-hov) !important; }
  :global(.flatpickr-current-month .numInputWrapper) {
    background:var(--book-pill) !important; border-radius:var(--book-r) !important; border:none !important;
    padding:0 !important; width:82px !important; flex-shrink:0 !important; transition:background .15s !important;
  }
  :global(.flatpickr-current-month .numInputWrapper:hover) { background:var(--book-pill-hov) !important; }
  :global(.flatpickr-current-month .numInputWrapper span) { display:none !important; }
  :global(.flatpickr-current-month input.cur-year) {
    background:transparent !important; border:none !important; color:#fff !important;
    font-family:var(--font) !important; font-size:1.05rem !important; font-weight:700 !important;
    padding:10px 8px !important; width:100% !important; text-align:center !important;
  }
  :global(.flatpickr-prev-month), :global(.flatpickr-next-month) {
    fill:rgba(255,255,255,.55) !important; color:rgba(255,255,255,.55) !important;
    padding:6px 8px !important; position:static !important; display:flex !important; align-items:center !important;
  }
  :global(.flatpickr-prev-month:hover svg), :global(.flatpickr-next-month:hover svg) { fill:#fff !important; }
  :global(.flatpickr-weekdays) { margin-top:4px; }
  :global(.flatpickr-weekday) { color:var(--color-muted) !important; font-weight:600 !important; font-size:.78rem !important; }
  :global(.flatpickr-day.available) {
    background:var(--color-ocean-10); color:var(--color-ocean); font-weight:700;
    box-shadow:inset 0 0 0 3px var(--color-bg);
  }
  :global(.flatpickr-day.available:hover),
  :global(.flatpickr-day.selected),
  :global(.flatpickr-day.selected:hover) {
    background:var(--color-ocean) !important; border-color:var(--color-ocean) !important;
    color:#fff !important; box-shadow:inset 0 0 0 3px rgba(255,255,255,.2) !important;
  }
  :global(.flatpickr-day.flatpickr-disabled) { opacity:1 !important; color:var(--color-disabled) !important; cursor:default; }

  /* ── Spots badge ── */
  .spots-row   { display:flex; align-items:center; justify-content:center; padding:12px 24px 18px; border-top:1px solid var(--color-border); }
  .spots-badge { display:inline-flex; align-items:center; gap:6px; background:var(--color-ocean-08); color:var(--color-ocean); font-size:.82rem; font-weight:600; padding:6px 14px; border-radius:20px; }
  .spots-badge.low { background:var(--color-red-08); color:var(--color-red); }

  /* ── Included ── */
  .included-list { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .included-item { display:flex; align-items:center; gap:10px; font-size:.83rem; color:var(--color-charcoal); }
  .included-icon { width:32px; height:32px; flex-shrink:0; background:var(--color-ocean-10); border-radius:var(--book-r); display:flex; align-items:center; justify-content:center; color:var(--color-ocean); }
  .included-note { font-size:.78rem; color:var(--color-muted); margin-top:14px; }
  @media (max-width:480px) { .included-list { grid-template-columns:1fr; } }

  /* ── Date chip ── */
  .date-chip       { display:flex; align-items:center; justify-content:space-between; background:var(--color-ocean); color:#fff; border-radius:var(--book-r-card); padding:14px 20px; margin-bottom:16px; }
  .date-chip-left  { display:flex; align-items:center; gap:12px; }
  .date-chip-icon  { width:36px; height:36px; background:rgba(255,255,255,.2); border-radius:var(--book-r); display:flex; align-items:center; justify-content:center; }
  .date-chip-date  { font-size:1rem; font-weight:700; }
  .date-chip-sub   { font-size:.78rem; opacity:.75; margin-top:1px; }
  .date-chip-change {
    background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.4);
    border-radius:var(--book-r); color:#fff; font-family:var(--font);
    font-size:.82rem; font-weight:700; padding:8px 16px; cursor:pointer; white-space:nowrap; transition:background .15s;
  }
  .date-chip-change:hover { background:rgba(255,255,255,.28); }

  /* ── Guest counter ── */
  .guest-counter { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border:1px solid var(--color-border); border-radius:var(--book-r); }
  .guest-label   { font-size:.9rem; font-weight:600; color:var(--color-charcoal); }
  .guest-sub     { font-size:.78rem; color:var(--color-muted); margin-top:1px; }
  .guest-controls{ display:flex; align-items:center; gap:14px; }
  .guest-btn {
    width:36px; height:36px; border-radius:50%; border:2px solid var(--color-border); background:var(--color-bg);
    font-size:1.2rem; font-weight:700; color:var(--color-charcoal); cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:border-color .15s, color .15s;
  }
  .guest-btn:hover:not(:disabled) { border-color:var(--color-ocean); color:var(--color-ocean); }
  .guest-btn:disabled { opacity:.3; cursor:default; }
  .guest-count { font-size:1.2rem; font-weight:700; min-width:24px; text-align:center; }

  /* ── Form ── */
  .form-group   { margin-bottom:14px; }
  .form-group label { display:block; font-size:.83rem; font-weight:600; color:var(--color-charcoal); margin-bottom:5px; }
  .form-group input { width:100%; padding:10px 14px; border:1px solid var(--color-border); border-radius:var(--book-r); font-family:var(--font); font-size:.95rem; color:var(--color-text); transition:border-color .15s; }
  .form-group input:focus { outline:none; border-color:var(--color-ocean); }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width:480px) { .form-row { grid-template-columns:1fr; } }

  /* ── Price ── */
  .price-summary { border:1px solid var(--color-border); border-radius:var(--book-r); overflow:hidden; margin:16px 0 20px; }
  .price-row     { display:flex; justify-content:space-between; align-items:center; padding:11px 16px; font-size:.88rem; border-bottom:1px solid var(--color-border); }
  .price-row:last-child { border:none; }
  .price-row.total   { font-weight:700; font-size:.95rem; background:var(--color-row-alt); }
  .price-row.deposit { color:var(--color-ocean); font-weight:700; background:var(--color-ocean-04); }
  .price-label { color:var(--color-muted); }

  /* ── Pay ── */
  .btn-pay {
    width:100%; padding:15px; background:var(--color-ocean); color:#fff; border:none;
    border-radius:var(--book-r); font-family:var(--font); font-size:1rem; font-weight:700;
    cursor:pointer; letter-spacing:.02em; transition:background .15s;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .btn-pay:hover    { background:var(--color-ocean-dk); }
  .btn-pay:disabled { opacity:.5; cursor:default; }
  .pay-note { text-align:center; font-size:.76rem; color:var(--color-muted); margin-top:10px; }
  .spinner  { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .6s linear infinite; }

  /* ── Alert ── */
  .alert       { padding:11px 14px; border-radius:var(--book-r); font-size:.86rem; margin-bottom:14px; }
  .alert.error { background:var(--color-err-bg); border:1px solid var(--color-err-border); color:var(--color-err-text); }
  .alert.info  { background:var(--color-info-bg); border:1px solid var(--color-info-border); color:var(--color-info-text); }
</style>
