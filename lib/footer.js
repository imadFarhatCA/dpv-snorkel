// Shared footer. Mount with <div data-footer-mount></div>.
function renderFooter() {
  const cfg = window.DPV_CONFIG || {};
  const baseUrl = cfg.BASEONE_URL || 'https://www.baseone.it';
  const year = new Date().getFullYear();
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <a href="${baseUrl}" class="footer-logo">
          <img src="resourcesImages/logo_base1.png" alt="Base One Sardinia" />
        </a>
        <p class="footer-text">Operated from <a href="${baseUrl}">Base One Sardinia</a> in Cala Gonone in partnership with Suex S.r.l. Coastal routes selected for safety and conditions across Sardinia.</p>
        <p class="footer-copy">© ${year} Base One Sardinia · <a href="${baseUrl}">www.baseone.it</a></p>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-footer-mount]').forEach(el => {
    el.outerHTML = renderFooter();
  });
});
