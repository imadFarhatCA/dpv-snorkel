// Shared form-validation helpers. Add new rules here, not inline.
window.DPVValidate = {
  required(value) {
    return typeof value === 'string' && value.trim().length > 0;
  },

  email(value) {
    if (!this.required(value)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  },

  // Loose phone check: keep digits only, require at least 6.
  phone(value) {
    if (!value) return true; // optional
    const digits = String(value).replace(/\D/g, '');
    return digits.length >= 6;
  },

  // Returns { ok: bool, field: string|null, msg: string }
  bookingForm({ name, email, phone, lang = 'en' }) {
    const t = (en, it) => (lang === 'en' ? en : it);
    if (!this.required(name))  return { ok: false, field: 'name',  msg: t('Please enter your name.',   'Inserisci il tuo nome.') };
    if (!this.email(email))    return { ok: false, field: 'email', msg: t('Please enter a valid email.', 'Inserisci un\'email valida.') };
    if (!this.phone(phone))    return { ok: false, field: 'phone', msg: t('Please enter a valid phone number.', 'Inserisci un numero di telefono valido.') };
    return { ok: true, field: null, msg: '' };
  },
};
