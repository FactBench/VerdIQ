/* Progressive enhancements; all guide content and navigation work without JS. */
(() => {
  const menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) menu.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  // Preview visits must not pollute the public site's analytics.
  if (location.hostname === 'factbench.github.io') {
    const analytics = document.createElement('script');
    analytics.async = true;
    analytics.src = 'https://www.googletagmanager.com/gtag/js?id=G-CXPNJ0FEG7';
    document.head.appendChild(analytics);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-CXPNJ0FEG7');
    document.querySelectorAll('.amazon-link').forEach((link) => {
      link.addEventListener('click', () => {
        window.gtag('event', 'affiliate_click', {
          link_url: link.href,
          link_domain: 'amazon.com',
          guide: 'best-4k-monitors'
        });
      });
    });
  }
})();
