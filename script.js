window.currentLang = 'en';

function scrollVideos(dir) {
  const slider = document.getElementById('videoSlider');
  const card = slider.querySelector('.video-card');
  slider.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: 'smooth' });
}

function setLang(lang) {
  window.currentLang = lang;
  document.querySelectorAll('.en').forEach(el => el.hidden = lang !== 'en');
  document.querySelectorAll('.it').forEach(el => el.hidden = lang !== 'it');
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
}
