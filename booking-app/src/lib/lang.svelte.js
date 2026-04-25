/** Reactive language store — 'en' | 'it' */
export const lang = $state({ value: 'en' });

export function setLang(value) {
  lang.value = value === 'it' ? 'it' : 'en';
}

/** Helper: pick string based on current lang */
export function t(en, it) {
  return lang.value === 'it' ? it : en;
}
