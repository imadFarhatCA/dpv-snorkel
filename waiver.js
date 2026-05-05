const BASE1_LOGO = 'data:image/png;base64,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';

// ===== Minor toggle =====
function toggleMinor(checked) {
  document.getElementById('guardianFields').hidden = !checked;
  document.getElementById('guardianSigSection').hidden = !checked;
  // Re-size the guardian canvas now that it's visible (it had 0×0 dimensions while hidden)
  if (checked && typeof guardianSigPad !== 'undefined' && guardianSigPad?.resize) {
    requestAnimationFrame(() => guardianSigPad.resize());
  }
}

// ===== Signature canvases =====
const sigState = { sig: false, guardian: false };

function setupCanvas(canvasId, labelId, key) {
  const canvas = document.getElementById(canvasId);
  const label = document.getElementById(labelId);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    sigState[key] = false;
    label.classList.remove('hidden');
  }
  resize();

  let drawing = false, lastX = 0, lastY = 0;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.clientWidth / rect.width;
    const scaleY = canvas.clientHeight / rect.height;
    if (e.touches) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    sigState[key] = true;
    label.classList.add('hidden');
    const pos = getPos(e);
    lastX = pos.x; lastY = pos.y;
  }
  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x; lastY = pos.y;
  }
  function stop() { drawing = false; }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('mouseleave', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stop);

  return { canvas, ctx, resize };
}

const sigPad = setupCanvas('sigCanvas', 'sigLabel', 'sig');
const guardianSigPad = setupCanvas('guardianSigCanvas', 'guardianSigLabel', 'guardian');

function clearSig(key) {
  if (key === 'sig') {
    sigPad.ctx.clearRect(0, 0, sigPad.canvas.width, sigPad.canvas.height);
    document.getElementById('sigLabel').classList.remove('hidden');
  } else {
    guardianSigPad.ctx.clearRect(0, 0, guardianSigPad.canvas.width, guardianSigPad.canvas.height);
    document.getElementById('guardianSigLabel').classList.remove('hidden');
  }
  sigState[key] = false;
}

function captureCanvas(canvas) {
  const tmp = document.createElement('canvas');
  tmp.width = canvas.width;
  tmp.height = canvas.height;
  const ctx2 = tmp.getContext('2d');
  ctx2.fillStyle = 'white';
  ctx2.fillRect(0, 0, tmp.width, tmp.height);
  ctx2.drawImage(canvas, 0, 0);
  return tmp.toDataURL('image/jpeg', 0.92);
}

// ===== Form validation =====
let _waiverSubmitting = false;
document.getElementById('waiverForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (_waiverSubmitting) return;
  const errorEl = document.getElementById('errorMsg');
  errorEl.style.display = 'none';

  const name = document.getElementById('fname').value.trim();
  const dob = document.getElementById('dob').value;
  const nationality = document.getElementById('nationality').value.trim();
  const emergency = document.getElementById('emergency').value.trim();
  const isMinor = document.getElementById('isMinor').checked;
  const guardianName = document.getElementById('guardianName').value.trim();
  const guardianRelation = document.getElementById('guardianRelation').value.trim();

  const errEN = [], errIT = [];

  const missing = [];
  const missingIT = [];
  if (!name)        { missing.push('Full name');         missingIT.push('Nome completo'); }
  if (!dob)         { missing.push('Date of birth');     missingIT.push('Data di nascita'); }
  if (!nationality) { missing.push('Nationality');       missingIT.push('Nazionalità'); }
  if (!emergency)   { missing.push('Emergency contact'); missingIT.push('Contatto di emergenza'); }
  if (missing.length) {
    errEN.push(`Please fill in: ${missing.join(', ')}.`);
    errIT.push(`Compila: ${missingIT.join(', ')}.`);
  }
  if (!document.getElementById('medConfirm').checked) {
    errEN.push('Please confirm the medical eligibility declaration.');
    errIT.push('Conferma la dichiarazione di idoneità medica.');
  }
  if (!document.getElementById('ackConfirm').checked) {
    errEN.push('Please confirm all participant acknowledgements.');
    errIT.push('Conferma tutte le dichiarazioni del partecipante.');
  }
  if (!sigState.sig) {
    errEN.push('Please add your signature.');
    errIT.push('Aggiungi la tua firma.');
  }
  if (isMinor) {
    if (!guardianName || !guardianRelation) {
      errEN.push('Please complete the parent/guardian information.');
      errIT.push('Compila i dati del genitore/tutore.');
    }
    if (!sigState.guardian) {
      errEN.push('Please add the guardian signature.');
      errIT.push('Aggiungi la firma del tutore.');
    }
  }

  if (errEN.length > 0) {
    errorEl.textContent = window.currentLang === 'it' ? errIT.join(' ') : errEN.join(' ');
    errorEl.style.display = 'block';
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  _waiverSubmitting = true;
  const submitBtn = document.querySelector('.btn-generate');
  const setBtnText = (en, it) => {
    if (!submitBtn) return;
    const enEl = submitBtn.querySelector('.en');
    const itEl = submitBtn.querySelector('.it');
    if (enEl) enEl.textContent = en;
    if (itEl) itEl.textContent = it;
  };
  if (submitBtn) {
    submitBtn.disabled = true;
    setBtnText('Submitting…', 'Invio in corso…');
  }

  const signatureImg = captureCanvas(sigPad.canvas);
  const guardianSignatureImg = isMinor ? captureCanvas(guardianSigPad.canvas) : null;

  // Stash the captured data so the success screen can offer a PDF download
  const waiverData = {
    lang: window.currentLang,
    name, dob, nationality, emergency,
    isMinor, guardianName, guardianRelation,
    signatureImg,
    guardianSignatureImg,
    date: new Date().toLocaleDateString(window.currentLang === 'it' ? 'it-IT' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    timestamp: new Date().toLocaleString(window.currentLang === 'it' ? 'it-IT' : 'en-GB'),
  };
  window.__lastWaiverData = waiverData;

  const urlParams = new URLSearchParams(window.location.search);
  const bookingToken = urlParams.get('token');
  const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8789'
    : 'https://dpv-booking.imad-farhat-c3c.workers.dev';

  const submitToBackend = async () => {
    if (!bookingToken) return { skipped: true };
    const res = await fetch(`${API}/api/waiver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: bookingToken,
        name, dob, nationality, emergency,
        isMinor, guardianName, guardianRelation,
        signature: signatureImg,
        guardianSignature: guardianSignatureImg
      })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Server error (${res.status})`);
    }
    return res.json();
  };

  submitToBackend()
    .then((result) => {
      const wasSubmitted = !result?.skipped;
      // No booking token? Auto-download since we couldn't save it server-side.
      if (!wasSubmitted) {
        try { buildPDF(waiverData); } catch (e) { console.error(e); }
      }
      showWaiverSuccess(wasSubmitted);
    })
    .catch((err) => {
      console.error('Waiver submission failed:', err);
      errorEl.textContent = window.currentLang === 'it'
        ? `Invio fallito: ${err.message}. Riprova o contattaci.`
        : `Submission failed: ${err.message}. Please try again or contact us.`;
      errorEl.style.display = 'block';
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      _waiverSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        setBtnText('Submit Waiver', 'Invia Liberatoria');
      }
    });
});

function showWaiverSuccess(wasSubmitted) {
  const form = document.getElementById('waiverForm');
  if (!form) return;
  const isIt = window.currentLang === 'it';
  const heading = isIt ? 'Liberatoria Inviata' : 'Waiver Submitted';
  const message = wasSubmitted
    ? (isIt
        ? 'Grazie! La tua liberatoria firmata è stata salvata in modo sicuro. Ci vediamo in acqua.'
        : 'Thank you! Your signed waiver has been securely saved. See you in the water.')
    : (isIt
        ? 'Il PDF firmato è stato generato. Per favore portane una copia il giorno dell\'attività.'
        : 'Your signed PDF has been generated. Please bring a copy on the day of the activity.');

  const wrapper = document.createElement('div');
  wrapper.className = 'waiver-success';
  wrapper.style.cssText = 'background:#fff;border:1px solid #d1fae5;border-radius:14px;padding:48px 32px;text-align:center;max-width:560px;margin:40px auto;';
  wrapper.innerHTML = `
    <div style="width:80px;height:80px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h2 style="font-size:24px;font-weight:700;color:#101820;margin:0 0 12px;">${heading}</h2>
    <p style="font-size:15px;color:#4b5563;line-height:1.6;margin:0 0 28px;max-width:420px;margin-left:auto;margin-right:auto;">${message}</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      <button type="button" id="downloadCopyBtn" style="display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:#fff;border:1.5px solid #0693e3;color:#0693e3;border-radius:8px;font-weight:600;font-size:14px;cursor:pointer;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ${isIt ? 'Scarica Copia PDF' : 'Download PDF Copy'}
      </button>
      <a href="https://www.sardiniasnorkeldpv.com" style="display:inline-block;padding:12px 24px;background:#0693e3;color:#fff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">${isIt ? 'Torna al sito' : 'Back to site'}</a>
    </div>`;
  form.replaceWith(wrapper);

  document.getElementById('downloadCopyBtn')?.addEventListener('click', () => {
    try {
      if (window.__lastWaiverData) buildPDF(window.__lastWaiverData);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert(isIt ? 'Errore durante la generazione del PDF.' : 'Could not generate the PDF.');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== PDF Generation =====
function buildPDF(d) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

  const M = 18, PW = 210, PH = 297, CW = PW - 2 * M;
  let y = M;

  const newPage = () => { doc.addPage(); y = M; };
  const checkY = (need) => { if (y + need > PH - M) newPage(); };

  function txt(text, x, w, lineH, bold, size, r, g, b) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(r, g, b);
    const lines = doc.splitTextToSize(text, w);
    checkY(lines.length * lineH + 2);
    doc.text(lines, x, y);
    y += lines.length * lineH;
  }

  function gap(n) { y += n || 5; }

  function rule(light) {
    checkY(8);
    doc.setDrawColor(light ? 220 : 180, light ? 220 : 180, light ? 220 : 180);
    doc.setLineWidth(0.25);
    doc.line(M, y, PW - M, y);
    y += 5;
  }

  function sectionHead(label) {
    checkY(14);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(M, y - 4, CW, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(label, M + 4, y + 1);
    y += 10;
  }

  function field(label, value) {
    checkY(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', M, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(value || '—', CW - 52);
    doc.text(lines, M + 52, y);
    y += Math.max(lines.length * 4.5, 6);
  }

  function checkedItem(text) {
    checkY(9);
    doc.setFillColor(17, 17, 17);
    doc.rect(M, y - 2.6, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(text, CW - 6);
    checkY(lines.length * 4.5 + 2);
    doc.text(lines, M + 5, y);
    y += lines.length * 4.5 + 1.5;
  }

  function bulletItem(text) {
    checkY(7);
    doc.setFillColor(140, 140, 140);
    doc.circle(M + 1.2, y - 1.2, 0.7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(text, CW - 5);
    doc.text(lines, M + 4, y);
    y += lines.length * 4.2 + 0.5;
  }

  // ---- HEADER ----
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, PW, 30, 'F');
  // Logo
  try { doc.addImage(BASE1_LOGO, 'PNG', M, 3, 24, 24); } catch(e) {}
  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BASE1 SARDINIA', M + 30, 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('DPV Snorkelling Experience  ·  DPV equipment by SUEX Srl', M + 30, 21);
  // Address
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('Via C. Colombo 15, Cala Gonone, Dorgali 08022 (NU)  ·  www.baseone.it', PW - M, 13, { align: 'right' });
  y = 38;

  const titleText = d.lang === 'it'
    ? 'LIBERATORIA DI RESPONSABILITÀ, RINUNCIA A RICHIESTE DI RISARCIMENTO\nE ACCORDO DI ASSUNZIONE DEL RISCHIO'
    : 'PARTICIPANT RELEASE OF LIABILITY, WAIVER OF CLAIMS\nAND ASSUMPTION OF RISK AGREEMENT';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(17, 17, 17);
  const titleLines = doc.splitTextToSize(titleText, CW);
  doc.text(titleLines, PW / 2, y, { align: 'center' });
  y += titleLines.length * 6 + 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 140, 140);
  doc.text(
    d.lang === 'it' ? 'Esperienza di Snorkelling con DPV — Base1 Sardinia' : 'DPV Snorkelling Experience — Base1 Sardinia',
    PW / 2, y, { align: 'center' }
  );
  y += 10;
  rule();

  const intro = d.lang === 'it'
    ? "Il partecipante sottoscritto dichiara di aver letto, compreso e di accettare volontariamente tutte le condizioni del presente accordo, incluse la descrizione dell'attività (Sez. 1), i requisiti di partecipazione (Sez. 2), le condizioni di idoneità medica (Sez. 3), i rischi e pericoli (Sez. 4), l'assunzione del rischio (Sez. 5), la liberatoria di responsabilità (Sez. 6), il diritto di rifiuto (Sez. 7), il consenso per fotografie (Sez. 8), la manleva (Sez. 9) e la legge applicabile (Sez. 11)."
    : 'The undersigned participant confirms they have read, understood, and voluntarily agree to all terms of this Agreement, including: description of activity (Sec. 1), participant requirements (Sec. 2), medical eligibility and exclusion conditions (Sec. 3), risks and hazards (Sec. 4), assumption of risk (Sec. 5), release of liability (Sec. 6), right to refuse participation (Sec. 7), photography consent (Sec. 8), indemnification (Sec. 9), and governing law (Sec. 11).';
  txt(intro, M, CW, 4.5, false, 8.5, 70, 70, 70);
  gap(8);

  sectionHead(d.lang === 'it' ? 'SEZIONE A — INFORMAZIONI DEL PARTECIPANTE' : 'SECTION A — PARTICIPANT INFORMATION');

  let dobDisplay = d.dob;
  try { dobDisplay = new Date(d.dob + 'T12:00:00').toLocaleDateString(d.lang === 'it' ? 'it-IT' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); } catch(e) {}

  field(d.lang === 'it' ? 'Nome e Cognome' : 'Full Name', d.name);
  field(d.lang === 'it' ? 'Data di Nascita' : 'Date of Birth', dobDisplay);
  field(d.lang === 'it' ? 'Nazionalità' : 'Nationality', d.nationality);
  field(d.lang === 'it' ? 'Contatto di Emergenza' : 'Emergency Contact', d.emergency);
  gap(6);

  sectionHead(d.lang === 'it' ? 'SEZIONE B — DICHIARAZIONE DI IDONEITÀ MEDICA' : 'SECTION B — MEDICAL ELIGIBILITY DECLARATION');

  const medIntro = d.lang === 'it'
    ? 'Il partecipante dichiara di non soffrire di alcuna delle seguenti condizioni che escludono la partecipazione:'
    : 'The participant confirms they do not suffer from any of the following conditions that exclude participation:';
  txt(medIntro, M, CW, 4.5, false, 8.5, 80, 80, 80);
  gap(3);

  const conditions = d.lang === 'it' ? [
    'Malattie cardiache, angina, aritmia o condizioni cardiovascolari',
    'Precedenti ictus o attacchi ischemici transitori (TIA)',
    'Asma o patologie respiratorie croniche',
    'Epilessia o convulsioni',
    'Perforazione del timpano o condizioni croniche auricolari/sinusali',
    'Infezione respiratoria attiva nel giorno dell\'attività',
    'Diabete insulino-dipendente senza autorizzazione medica scritta',
    'Interventi chirurgici recenti, infortuni o limitazioni fisiche',
    'Gravidanza',
    'Qualsiasi condizione controindicata dal medico per attività acquatiche'
  ] : [
    'Heart disease, angina, irregular heartbeat, or cardiovascular conditions',
    'History of stroke or transient ischaemic attack (TIA)',
    'Asthma or chronic respiratory conditions',
    'Epilepsy or conditions causing seizures or loss of consciousness',
    'Perforated eardrum or chronic ear, nose, or sinus conditions',
    'Active respiratory infection on the day of the activity',
    'Insulin-dependent diabetes without written medical clearance',
    'Recent surgery, injury, or physical impairment',
    'Pregnancy',
    'Any condition the participant\'s physician has indicated is incompatible with aquatic activity'
  ];

  conditions.forEach(c => bulletItem(c));
  gap(4);
  checkedItem(d.lang === 'it'
    ? 'Confermato — il partecipante soddisfa tutti i requisiti di partecipazione (Sez. 2) e non è affetto da alcuna delle condizioni di esclusione sopra elencate (Sez. 3).'
    : 'Confirmed — the participant meets all participation requirements (Sec. 2) and does not suffer from any of the excluding conditions listed above (Sec. 3).');
  gap(6);

  sectionHead(d.lang === 'it' ? 'SEZIONE C — DICHIARAZIONI DEL PARTECIPANTE' : 'SECTION C — PARTICIPANT ACKNOWLEDGEMENTS');

  const acks = d.lang === 'it' ? [
    'Soddisfo il requisito di età minima (10 anni), oppure il presente accordo è firmato da un genitore o tutore legale per conto di un minore',
    'Sono in grado di nuotare autonomamente per almeno 50 metri in acque aperte',
    'Non sono sotto l\'effetto di alcol o di qualsiasi sostanza che possa compromettere il mio giudizio o la mia coordinazione fisica',
    'Ho dichiarato tutte le condizioni mediche rilevanti e non soffro di nessuna delle condizioni di esclusione elencate nella Sezione 3',
    'Comprendo e accetto i rischi descritti nella Sezione 4 del presente accordo',
    'Acconsento all\'utilizzo di fotografie e video da parte di Base1 Sardinia come descritto nella Sezione 8',
    'Seguirò in ogni momento le istruzioni della guida e dell\'equipaggio di Base1 Sardinia',
    'Informerò immediatamente la guida in caso di qualsiasi disagio, difficoltà o variazione delle mie condizioni durante l\'attività',
    'Ho avuto la possibilità di porre domande prima di firmare il presente accordo'
  ] : [
    'I meet the minimum age requirement (10 years), or this Agreement is being signed by a parent or legal guardian on behalf of a minor',
    'I am able to swim unaided for at least 50 metres in open water',
    'I am not under the influence of alcohol or any substance that may impair my judgement or physical coordination',
    'I have disclosed all relevant medical conditions and do not suffer from any excluding condition listed in Section 3',
    'I understand and accept the risks described in Section 4 of the Agreement',
    'I consent to photography and video use by Base1 Sardinia as described in Section 8',
    'I will follow all instructions given by the Base1 Sardinia guide and crew at all times',
    'I will inform the guide immediately of any discomfort, difficulty, or change in condition during the activity',
    'I have had the opportunity to ask questions before signing this Agreement'
  ];

  acks.forEach(a => checkedItem(a));
  gap(6);

  sectionHead(d.lang === 'it' ? 'SEZIONE D — FIRMA DEL PARTECIPANTE' : 'SECTION D — PARTICIPANT SIGNATURE');

  checkY(42);
  doc.addImage(d.signatureImg, 'JPEG', M, y, 90, 34);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.25);
  doc.line(M, y + 34, M + 90, y + 34);
  y += 39;

  field(d.lang === 'it' ? 'Nome (in stampatello)' : 'Full Name (printed)', d.name);
  field(d.lang === 'it' ? 'Data' : 'Date', d.date);
  gap(6);

  if (d.isMinor && d.guardianName) {
    sectionHead(d.lang === 'it' ? 'SEZIONE E — DICHIARAZIONE DEL GENITORE/TUTORE' : 'SECTION E — PARENT / GUARDIAN DECLARATION');

    const gIntro = d.lang === 'it'
      ? "Firmo il presente accordo in qualità di genitore o tutore legale del partecipante minorenne sopra indicato, confermo che tutte le informazioni fornite sono accurate e mi assumo la responsabilità per la sua partecipazione."
      : "I sign this Agreement as the parent or legal guardian of the minor participant named above, confirm that all information provided is accurate, and accept responsibility for their participation.";
    txt(gIntro, M, CW, 4.5, false, 8.5, 80, 80, 80);
    gap(5);

    if (d.guardianSignatureImg) {
      checkY(42);
      doc.addImage(d.guardianSignatureImg, 'JPEG', M, y, 90, 34);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.25);
      doc.line(M, y + 34, M + 90, y + 34);
      y += 39;
    }

    field(d.lang === 'it' ? 'Nome del Tutore (in stampatello)' : 'Guardian Full Name (printed)', d.guardianName);
    field(d.lang === 'it' ? 'Relazione con il Minore' : 'Relationship to Minor', d.guardianRelation);
    field(d.lang === 'it' ? 'Data' : 'Date', d.date);
    gap(6);
  }

  checkY(14);
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.25);
  doc.line(M, y, PW - M, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 170);
  doc.text(
    d.lang === 'it'
      ? `Base1 Sardinia  ·  Attrezzatura DPV by SUEX Srl  ·  Compilato elettronicamente: ${d.timestamp}`
      : `Base1 Sardinia  ·  DPV equipment by SUEX Srl  ·  Completed electronically: ${d.timestamp}`,
    PW / 2, y, { align: 'center' }
  );

  const safeName = d.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`waiver_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`);
}
