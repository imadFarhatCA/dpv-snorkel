// Shared language toggle. Mount with <div data-lang-toggle-mount></div>.
function renderLangToggle() {
  return `
    <div class="lang-toggle lang-toggle-content" role="group" aria-label="Language">
      <button class="lang-btn active" data-lang="en" onclick="setLang('en')" aria-label="Switch to English">English</button>
      <button class="lang-btn" data-lang="it" onclick="setLang('it')" aria-label="Passa all'italiano">Italiano</button>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-lang-toggle-mount]').forEach(el => {
    el.outerHTML = renderLangToggle();
  });
});
