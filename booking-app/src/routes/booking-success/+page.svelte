<script>
  import { onMount } from 'svelte';
  import { t } from '$lib/lang.svelte.js';
  import { API } from '$lib/api.js';

  let booking   = $state(null);
  let error     = $state(false);
  let loading   = $state(true);

  let balance   = $derived(booking ? (booking.total_amount - booking.deposit_amount).toFixed(2) : '0');
  let icsUrl    = $derived(booking ? `${API}/calendar/${booking.ical_token}.ics` : '');
  let gcUrl     = $derived.by(() => {
    if (!booking) return '';
    const nextDay = (() => {
      const d = new Date(booking.date + 'T12:00:00Z');
      d.setUTCDate(d.getUTCDate() + 1);
      return d.toISOString().slice(0,10).replace(/-/g,'');
    })();
    return `https://calendar.google.com/calendar/render?action=TEMPLATE`
      + `&text=${encodeURIComponent('DPV Snorkel Experience — Base One')}`
      + `&dates=${booking.date.replace(/-/g,'')}/${nextDay}`
      + `&details=${encodeURIComponent(`Guests: ${booking.guests}\nDeposit paid: €${booking.deposit_amount}\nBalance due: €${balance}\n\nMeeting point: Porto di Cala Gonone`)}`
      + `&location=${encodeURIComponent('Porto di Cala Gonone, Nuoro, Sardinia, Italy')}`;
  });

  onMount(async () => {
    const sessionId = new URLSearchParams(location.search).get('session_id');
    if (!sessionId) { error = true; loading = false; return; }

    try {
      const res  = await fetch(`${API}/api/confirm?session_id=${sessionId}`);
      const data = await res.json();
      if (!res.ok || !data.booking) { error = true; loading = false; return; }
      booking = data.booking;
    } catch {
      error = true;
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{t('Booking Confirmed', 'Prenotazione Confermata')} — DPV Snorkel · Base One</title>
</svelte:head>

<!-- Hero -->
<div class="success-hero">
  <div class="check-circle">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={error ? '#ef4444' : '#22c55e'} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      {#if error}
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      {:else}
        <polyline points="20 6 9 17 4 12"/>
      {/if}
    </svg>
  </div>
  <h1>
    {#if loading}
      {t('Loading…','Caricamento…')}
    {:else if error}
      {t('Something went wrong','Qualcosa è andato storto')}
    {:else}
      {t('Booking Confirmed!','Prenotazione Confermata!')}
    {/if}
  </h1>
  <p>
    {#if error}
      {t('Your payment may have been processed — please contact us.','Il pagamento potrebbe essere avvenuto — contattaci.')}
    {:else}
      {t('Your deposit has been received. See you on the water!','Il tuo deposito è stato ricevuto. Ci vediamo in acqua!')}
    {/if}
  </p>
</div>

<div class="success-body">

  {#if loading}
    <div class="loading-state">
      <span class="spinner"></span> {t('Loading your booking…','Caricamento prenotazione…')}
    </div>

  {:else if error}
    <div style="text-align:center;padding:40px 0">
      <p style="color:var(--color-muted);margin-bottom:24px">
        {t('If your payment was charged, your booking is confirmed — we\'ll be in touch shortly.','Se il pagamento è stato addebitato, la prenotazione è confermata — ti contatteremo a breve.')}
      </p>
      <a href="https://wa.me/message/BASEONE" target="_blank" rel="noopener" class="btn-primary">
        {t('Contact Base One','Contatta Base One')}
      </a>
    </div>

  {:else}
    <!-- Booking details card -->
    <div class="booking-card">
      <div class="booking-card-head">{t('Booking Confirmation','Conferma Prenotazione')}</div>
      <div class="booking-card-body">
        {#each [
          { label: t('Name','Nome'),                       val: booking.name,                                        cls: '' },
          { label: t('Date','Data'),                       val: booking.date,                                        cls: 'blue' },
          { label: t('Guests','Ospiti'),                   val: booking.guests,                                      cls: '' },
          { label: t('Meeting point','Punto di ritrovo'),  val: t('Porto di Cala Gonone · Arrive by 08:30','Porto di Cala Gonone · Arrivo entro le 08:30'), cls: '' },
          { label: t('Total price','Prezzo totale'),        val: `€${booking.total_amount.toFixed(2)}`,               cls: '' },
          { label: t('Deposit paid today ✓','Deposito pagato oggi ✓'), val: `€${booking.deposit_amount.toFixed(2)}`, cls: 'green' },
          { label: t('Balance due on the day','Saldo il giorno'), val: `€${balance}`,                                cls: '' },
        ] as row}
          <div class="detail-row">
            <span class="detail-label">{row.label}</span>
            <span class="detail-val {row.cls}">{row.val}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Balance reminder -->
    <div class="note-box">
      💳 {t(`Please bring <strong>€${balance}</strong> cash or card on the day. The balance is due before boarding.`,
            `Porta <strong>€${balance}</strong> in contanti o carta il giorno dell'attività.`)}
    </div>

    <!-- Add to calendar -->
    <div class="cal-section">
      <p class="cal-title">{t('Add to Your Calendar','Aggiungi al tuo Calendario')}</p>
      <div class="cal-buttons">
        <a href={icsUrl} download="dpv-trip-{booking.date}.ics" class="cal-btn primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {t('Add to iPhone / iCal','Aggiungi a iPhone / iCal')}
        </a>
        <a href={gcUrl} target="_blank" rel="noopener" class="cal-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {t('Add to Google Calendar','Aggiungi a Google Calendar')}
        </a>
        <a href={icsUrl} download class="cal-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          {t('Download .ics','Scarica .ics')}
        </a>
      </div>
      <p class="cal-note">{t('Tap "Add to iPhone / iCal" to add directly to iPhone Calendar or Mac Calendar.','Tocca "Aggiungi a iPhone / iCal" per aggiungere direttamente al Calendario iPhone o Mac.')}</p>
    </div>

    <!-- Actions -->
    <div class="actions">
      <a href="https://base1dpv.pages.dev" class="btn-primary">← {t('Back to DPV','Torna al DPV')}</a>
      <a href="https://wa.me/message/BASEONE" target="_blank" rel="noopener" class="btn-ghost">
        {t('Questions? WhatsApp us','Domande? Scrivici su WhatsApp')}
      </a>
    </div>
  {/if}

</div>

<style>
  .success-hero {
    background: var(--color-dark-alt);
    padding: calc(var(--nav-h) + 56px) 24px 56px;
    text-align: center; color: #fff;
  }
  .check-circle {
    width:72px; height:72px; background:rgba(34,197,94,.12); border-radius:50%;
    display:flex; align-items:center; justify-content:center; margin:0 auto 24px;
  }
  .success-hero h1 { font-size:clamp(1.6rem,4vw,2.4rem); font-weight:700; margin-bottom:10px; }
  .success-hero p  { color:rgba(255,255,255,.65); }

  .success-body { max-width:640px; margin:0 auto; padding:48px 24px 80px; }

  .loading-state { text-align:center; padding:60px 24px; color:var(--color-muted); font-size:.95rem; display:flex; align-items:center; justify-content:center; gap:10px; }
  .spinner { display:inline-block; width:20px; height:20px; border:2px solid rgba(0,0,0,.15); border-top-color:var(--color-ocean); border-radius:50%; animation:spin .7s linear infinite; }

  /* Booking card */
  .booking-card      { background:var(--color-bg-subtle); border:1px solid var(--color-border); border-radius:var(--radius-xl); overflow:hidden; margin-bottom:20px; }
  .booking-card-head { background:var(--color-ocean); color:#fff; padding:16px 22px; font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
  .booking-card-body { padding:22px; }
  .detail-row        { display:flex; justify-content:space-between; align-items:baseline; padding:9px 0; border-bottom:1px solid var(--color-border); font-size:.93rem; }
  .detail-row:last-child { border:none; }
  .detail-label { color:var(--color-muted); }
  .detail-val   { font-weight:600; color:var(--color-charcoal); }
  .detail-val.green { color:var(--color-success); }
  .detail-val.blue  { color:var(--color-ocean); }

  /* Note box */
  .note-box { background:var(--color-warn-bg); border:1px solid var(--color-warn-border); border-radius:var(--radius-lg); padding:14px 16px; font-size:.86rem; color:var(--color-warn-text); margin-bottom:20px; }

  /* Calendar section */
  .cal-section  { background:var(--color-bg-subtle); border:1px solid var(--color-border); border-radius:var(--radius-xl); padding:22px; margin-bottom:20px; }
  .cal-title    { font-size:.75rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--color-muted); margin-bottom:16px; }
  .cal-buttons  { display:flex; gap:10px; flex-wrap:wrap; }
  .cal-btn {
    display:inline-flex; align-items:center; gap:8px; padding:10px 18px;
    border:1px solid var(--color-border); border-radius:var(--radius-lg);
    background:var(--color-bg); color:var(--color-charcoal); font-family:var(--font); font-size:.88rem; font-weight:600;
    text-decoration:none; cursor:pointer; transition:border-color .15s, background .15s;
  }
  .cal-btn:hover   { border-color:var(--color-ocean); background:var(--color-ocean-04); }
  .cal-btn.primary { background:var(--color-ocean); color:#fff; border-color:transparent; }
  .cal-btn.primary:hover { background:var(--color-ocean-dk); }
  .cal-note { font-size:.78rem; color:var(--color-muted); margin-top:12px; }

  /* Actions */
  .actions   { display:flex; gap:12px; justify-content:center; margin-top:32px; flex-wrap:wrap; }
  .btn-primary {
    display:inline-block; padding:.7rem 1.4rem; background:var(--color-ocean); color:#fff;
    border-radius:var(--radius-lg); font-weight:700; font-size:.9rem; transition:background .15s;
  }
  .btn-primary:hover { background:var(--color-ocean-dk); }
  .btn-ghost {
    display:inline-block; padding:.7rem 1.4rem; border:1.5px solid var(--color-border);
    border-radius:var(--radius-lg); color:var(--color-charcoal); font-weight:600; font-size:.9rem; transition:border-color .15s;
  }
  .btn-ghost:hover { border-color:var(--color-ocean); color:var(--color-ocean); }
</style>
