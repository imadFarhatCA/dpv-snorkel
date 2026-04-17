// ===== Minor toggle =====
function toggleMinor(checked) {
  document.getElementById('guardianFields').hidden = !checked;
  document.getElementById('guardianSigSection').hidden = !checked;
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

  if (!name || !dob || !nationality || !emergency) {
    errEN.push('Please fill in all participant information fields.');
    errIT.push('Compila tutti i campi delle informazioni del partecipante.');
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
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = submitBtn.textContent.replace(/generate/i, 'Generating…'); }

  const signatureImg = captureCanvas(sigPad.canvas);
  const guardianSignatureImg = isMinor ? captureCanvas(guardianSigPad.canvas) : null;

  // POST waiver data to booking API if we have a booking token
  const urlParams = new URLSearchParams(window.location.search);
  const bookingToken = urlParams.get('token');
  if (bookingToken) {
    const API = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8789'
      : 'https://dpv-booking.imad-farhat-c3c.workers.dev';

    fetch(`${API}/api/waiver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: bookingToken,
        name, dob, nationality, emergency,
        isMinor, guardianName, guardianRelation,
        signature: signatureImg,
        guardianSignature: guardianSignatureImg
      })
    }).catch(err => console.error('Waiver API error:', err));
  }

  try {
    buildPDF({
      lang: window.currentLang,
      name, dob, nationality, emergency,
      isMinor, guardianName, guardianRelation,
      signatureImg,
      guardianSignatureImg,
      date: new Date().toLocaleDateString(window.currentLang === 'it' ? 'it-IT' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      timestamp: new Date().toLocaleString(window.currentLang === 'it' ? 'it-IT' : 'en-GB')
    });
  } catch (err) {
    errorEl.textContent = window.currentLang === 'it'
      ? 'Errore nella generazione del PDF. Riprova.'
      : 'Could not generate the PDF. Please try again.';
    errorEl.style.display = 'block';
    _waiverSubmitting = false;
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.textContent.replace(/generating…/i, 'Generate'); }
  }
});

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
  doc.rect(0, 0, PW, 26, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('BASE1 SARDINIA', PW / 2, 11, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('DPV Snorkelling Experience  ·  DPV equipment by SUEX Srl', PW / 2, 19, { align: 'center' });
  y = 34;

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
