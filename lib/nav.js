// Shared nav. Mount with:
// <div data-nav-mount data-back-url="URL" data-back-label="← Label" data-cta-url="URL" data-cta-label="Label"></div>
// Omit data-cta-url to render no CTA button.
function renderNav(el) {
  const cfg      = window.DPV_CONFIG || {};
  const backUrl   = el.dataset.backUrl   || '/';
  const backLabel = el.dataset.backLabel || '← Back';
  const ctaUrl    = el.dataset.ctaUrl    || '';
  const ctaLabel  = el.dataset.ctaLabel  || '';
  const cta       = ctaUrl ? `<a href="${ctaUrl}" class="btn btn-sm">${ctaLabel}</a>` : '';
  return `
    <nav class="nav">
      <a href="/" class="nav-logo" title="DPV Snorkel Experience">
        <img src="resourcesImages/logo_base1.png" alt="Base One Logo" />
      </a>
      <div class="nav-right">
        <a href="${backUrl}" class="nav-back">${backLabel}</a>
        ${cta}
      </div>
    </nav>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-nav-mount]').forEach(el => {
    el.outerHTML = renderNav(el);
  });
});
