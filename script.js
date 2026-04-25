window.currentLang = 'en';

function scrollVideos(dir) {
  const slider = document.getElementById('videoSlider');
  const card = slider.querySelector('.video-card');
  slider.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' });
}

// Toggles both the `hidden` attribute (used by index/cancellation/waiver)
// and the `.hidden` class (used by book.html), so a single function works site-wide.
function setLang(lang) {
  window.currentLang = lang;
  const showEn = lang === 'en';
  document.querySelectorAll('.en').forEach(el => {
    el.hidden = !showEn;
    el.classList.toggle('hidden', !showEn);
  });
  document.querySelectorAll('.it').forEach(el => {
    el.hidden = showEn;
    el.classList.toggle('hidden', showEn);
  });
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
}

// Stamp current year into any element with [data-current-year].
document.addEventListener('DOMContentLoaded', () => {
  const y = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = y; });
});
