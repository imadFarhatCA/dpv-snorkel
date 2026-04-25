<script>
  import { onMount } from 'svelte';
  import { lang, t } from '$lib/lang.svelte.js';
  import { API, fetchWithTimeout } from '$lib/api.js';
  import fp from 'flatpickr';
  import 'flatpickr/dist/flatpickr.min.css';
  import '$lib/flatpickr-theme.css';
  const flatpickr = fp.default ?? fp;

  // ── Helpers ──────────────────────────────────────
  function toKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  // ── State ────────────────────────────────────────
  let step            = $state(1);
  let _dates          = {};             // plain object for flatpickr (no proxy)
  let availableDates  = $state({});     // reactive copy for UI
  let selectedDate    = $state(null);
  let guestCount      = $state(1);
  let alertMsg        = $state('');
  let alertType       = $state('');
  let submitting      = $state(false);
  let fpInstance      = null;
  let overbookedModal = $state(false);
  let suggestedDate   = $state(null);

  // ── Form fields ──────────────────────────────────
  let name  = $state('');
  let email = $state('');
  let phone = $state('');

  // ── Derived ──────────────────────────────────────
  let spotsLeft = $derived(selectedDate ? (availableDates[selectedDate] ?? 0) : 0);
  let total     = $derived(guestCount * 90);

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
    t(`Pay Now — €${total}`, `Paga Ora — €${total}`)
  );

  // ── Flatpickr ────────────────────────────────────
  function markAvailable(inst) {
    inst.calendarContainer.querySelectorAll('.flatpickr-day.available, .flatpickr-day.full')
      .forEach(el => { el.classList.remove('available'); el.classList.remove('full'); });
    inst.calendarContainer
      .querySelectorAll('.flatpickr-day:not(.flatpickr-disabled):not(.prevMonthDay):not(.nextMonthDay)')
      .forEach(el => {
        const key = el.dateObj ? toKey(el.dateObj) : null;
        if (key && _dates[key] === 0) {
          el.classList.add('full');
        } else {
          el.classList.add('available');
        }
      });
  }

  function closestAvailable(fromDate) {
    const from = new Date(fromDate + 'T12:00:00Z');
    const next = Object.entries(_dates)
      .filter(([k, v]) => v > 0 && new Date(k + 'T12:00:00Z') > from)
      .sort(([a], [b]) => a.localeCompare(b));
    return next[0]?.[0] ?? null;
  }

  function fmtDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00Z');
    const days = lang.value === 'en'
      ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      : ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return lang.value === 'en'
      ? `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}`
      : `${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
  }

  function initCalendar() {
    const el = document.getElementById('fp-calendar');
    if (!el || fpInstance) return;
    fpInstance = flatpickr(el, {
      inline:     true,
      minDate:    'today',
      dateFormat: 'Y-m-d',
      locale:     { firstDayOfWeek: 1 },
      disable: [date => !(toKey(date) in _dates)],
      onReady(_, __, inst)       { setTimeout(() => markAvailable(inst), 50); },
      onMonthChange(_, __, inst) { setTimeout(() => markAvailable(inst), 50); },
      onChange(selected) {
        if (!selected.length) return;
        const key = toKey(selected[0]);
        selectedDate = key;
        if ((_dates[key] ?? 0) === 0) {
          suggestedDate = closestAvailable(key);
          overbookedModal = true;
          setTimeout(() => fpInstance?.clear(), 0);
          return;
        }
        guestCount = 1;
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
    guestCount = Math.max(1, Math.min(8, guestCount + delta));
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
          <span class="card-head-meta"><s style="color:var(--color-muted);opacity:.6">€120</s> €90 / {t('person', 'persona')} · max 8</span>
        </div>
        <div class="card-body" style="padding-bottom:0">
          <div id="fp-calendar"></div>
        </div>
        <!-- Only show the spots indicator when there's healthy availability.
             When spotsLeft <= 2 (low / overbooked), suppress entirely so the
             client never sees scarcity. Guest counter still caps via spotsLeft. -->
        {#if selectedDate && step === 1 && spotsLeft > 2}
          <div class="spots-row">
            <div class="spots-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              {spotsLeft} {t('spots left', 'posti disponibili')}
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
            📍 {t('Meeting point: Base1 Sardinia · Viale Colombo 15, Cala Gonone · 2:00 PM', 'Punto di ritrovo: Base1 Sardinia · Viale Colombo 15, Cala Gonone · 14:00')}
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
            <div class="date-chip-sub">{selectedDate?.slice(0,4)} · Viale Colombo 15, Cala Gonone · 2:00 PM</div>
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
          <span class="card-head-meta">{t('max 8 guests', 'max 8 ospiti')}</span>
        </div>
        <div class="card-body">
          <div class="guest-counter">
            <div>
              <div class="guest-label">{t('Guests', 'Ospiti')}</div>
              <div class="guest-sub"><s style="opacity:.5">€120</s> €90 {t('per person', 'a persona')}</div>
            </div>
            <div class="guest-controls">
              <button class="guest-btn" onclick={() => changeGuests(-1)} disabled={guestCount <= 1} aria-label={t('Remove guest','Rimuovi ospite')}>−</button>
              <span class="guest-count" aria-live="polite">{guestCount}</span>
              <button class="guest-btn" onclick={() => changeGuests(1)}  disabled={guestCount >= 8} aria-label={t('Add guest','Aggiungi ospite')}>+</button>
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
              <div class="price-row"><span class="price-label">{t('Price per person','Prezzo a persona')}</span><span><s class="old-price">€120</s> <strong>€90</strong></span></div>
              <div class="price-row promo"><span>🔥 {t('Promotion','Promozione')}</span><span>−25%</span></div>
              <div class="price-row"><span class="price-label">{t('Guests','Ospiti')}</span><span>{guestCount}</span></div>
              <div class="price-row total"><span>{t('Total','Totale')}</span><span>€{total}</span></div>
            </div>

            <button type="submit" class="btn-pay" disabled={submitting}>
              {#if submitting}
                <span class="spinner"></span> {t('Redirecting to Stripe…','Reindirizzamento a Stripe…')}
              {:else}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                {payLabel}
              {/if}
            </button>
            <p class="pay-note">{t('Secure payment via Stripe · Full payment','Pagamento sicuro via Stripe · Pagamento completo')}</p>
          </form>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- ── Overbooked modal ── -->
{#if overbookedModal}
  <div class="modal-backdrop" onclick={() => overbookedModal = false} onkeydown={(e) => e.key === 'Escape' && (overbookedModal = false)} role="button" tabindex="-1" aria-label="Close dialog">
    <div class="modal-box" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="dialog" aria-modal="true" tabindex="-1">
      <button class="modal-close" onclick={() => overbookedModal = false} aria-label="Close">✕</button>
      <div class="modal-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r=".5" fill="#f59e0b"/>
        </svg>
      </div>
      <h3 class="modal-title">{t('Date Fully Booked', 'Data al Completo')}</h3>
      <p class="modal-text">
        {t('The day you picked is fully booked.', 'La data selezionata è al completo.')}
      </p>
      {#if suggestedDate}
        <p class="modal-suggest">
          {t('Next available date:', 'Prossima data disponibile:')}
          <strong> {fmtDate(suggestedDate)}</strong>
        </p>
        <button class="modal-btn-suggest" onclick={() => { overbookedModal = false; fpInstance?.setDate(suggestedDate); }}>
          {t('Pick this date →', 'Scegli questa data →')}
        </button>
        <p class="modal-or">{t('or', 'oppure')}</p>
      {/if}
      <a href="https://wa.me/message/BASEONE" target="_blank" rel="noopener" class="modal-btn-wa">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        {t('Message us on WhatsApp', 'Scrivici su WhatsApp')}
      </a>
    </div>
  </div>
{/if}

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

  /* ── Spots badge ── */
  .spots-row   { display:flex; align-items:center; justify-content:center; padding:12px 24px 18px; border-top:1px solid var(--color-border); }
  .spots-badge { display:inline-flex; align-items:center; gap:6px; background:var(--color-ocean-08); color:var(--color-ocean); font-size:.82rem; font-weight:600; padding:6px 14px; border-radius:20px; }

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
  .price-row.promo { color:var(--color-success, #16a34a); font-weight:700; background:rgba(22,163,106,.06); }
  .price-label { color:var(--color-muted); }
  .old-price { color:var(--color-muted); opacity:.6; text-decoration:line-through; margin-right:4px; font-weight:400; }

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
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── Overbooked modal ── */
  .modal-backdrop {
    position:fixed; inset:0; z-index:100;
    background:rgba(0,0,0,.55); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center; padding:24px;
    border:none; cursor:default;
  }
  .modal-box {
    background:#fff; border-radius:16px; padding:32px 28px 28px;
    max-width:360px; width:100%; position:relative;
    box-shadow:0 20px 60px rgba(0,0,0,.25); text-align:center;
  }
  .modal-close {
    position:absolute; top:12px; right:14px;
    background:none; border:none; font-size:1rem; color:var(--color-muted);
    cursor:pointer; padding:4px; line-height:1;
  }
  .modal-close:hover { color:var(--color-charcoal); }
  .modal-icon    { margin-bottom:12px; }
  .modal-title   { font-size:1.1rem; font-weight:700; color:var(--color-charcoal); margin-bottom:8px; }
  .modal-text    { font-size:.88rem; color:var(--color-muted); margin-bottom:6px; }
  .modal-suggest { font-size:.88rem; color:var(--color-charcoal); margin-bottom:14px; }
  .modal-or      { font-size:.8rem; color:var(--color-muted); margin:10px 0; }
  .modal-btn-suggest {
    display:block; width:100%; padding:12px;
    background:rgba(6,147,227,.08); border:1.5px solid var(--color-ocean);
    color:var(--color-ocean); border-radius:var(--book-r);
    font-family:var(--font); font-size:.9rem; font-weight:700;
    cursor:pointer; transition:background .15s;
  }
  .modal-btn-suggest:hover { background:rgba(6,147,227,.16); }
  .modal-btn-wa {
    display:flex; align-items:center; justify-content:center; gap:8px;
    width:100%; padding:14px;
    background:#25D366; color:#fff; border-radius:var(--book-r);
    font-family:var(--font); font-size:.95rem; font-weight:700;
    text-decoration:none; transition:background .15s;
  }
  .modal-btn-wa:hover { background:#1ebe5c; }

  /* ── Alert ── */
  .alert       { padding:11px 14px; border-radius:var(--book-r); font-size:.86rem; margin-bottom:14px; }
  .alert.error { background:var(--color-err-bg); border:1px solid var(--color-err-border); color:var(--color-err-text); }
  .alert.info  { background:var(--color-info-bg); border:1px solid var(--color-info-border); color:var(--color-info-text); }
</style>
