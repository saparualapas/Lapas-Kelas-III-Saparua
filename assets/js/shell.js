// ══════════════════════════════════════════════════════════
// APP SHELL — injects navbar + footer + splash into every page
// Usage: call initShell() after DOM ready
// ══════════════════════════════════════════════════════════

const SHELL = {

  // ── Splash Screen ────────────────────────────────────────
  showSplash() {
    const s = document.createElement('div');
    s.id = 'splash';
    s.innerHTML = `
      <div class="splash-inner">
        <div class="splash-logo-ring">
          <div class="splash-ring r1"></div>
          <div class="splash-ring r2"></div>
          <div class="splash-ring r3"></div>
          <img id="splash-logo" src="" alt="" class="splash-logo-img" />
        </div>
        <div class="splash-name" id="splash-name">LAPAS</div>
        <div class="splash-sub" id="splash-sub">Memuat...</div>
        <div class="splash-bar"><div class="splash-bar-fill" id="splash-fill"></div></div>
      </div>`;
    document.body.prepend(s);
  },

  hideSplash() {
    const s = document.getElementById('splash');
    if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 600); }
  },

  // ── Navbar HTML ──────────────────────────────────────────
  navbarHTML(settings, activePage) {
    const links = [
      { href: 'index',   label: 'Beranda',         key: 'home' },
      { href: 'profil',  label: 'Profil',           key: 'profil' },
      { href: 'berita',  label: 'Berita & Kegiatan',key: 'berita' },
      { href: 'layanan', label: 'Layanan',          key: 'layanan' },
    ];
    const navLinks = links.map(l =>
      `<li><a href="${l.href}.html" class="nav-link${activePage===l.key?' active':''}" data-key="${l.key}">${l.label}</a></li>`
    ).join('');
    const logoSrc = settings.logo_url || 'https://placehold.co/44x44/0D1B2A/C9A84C?text=L';
    const name    = settings.app_name || 'Lapas';
    const tagline = settings.app_tagline || 'Kementerian Hukum';
    const visitLink = settings.external_visit_link || '#';
    return `
    <nav class="navbar" id="navbar">
      <div class="navbar-brand">
        <img src="${logoSrc}" alt="Logo" class="navbar-logo lazy" loading="lazy" />
        <div class="brand-text">
          <span class="brand-name" id="nav-name">${name}</span>
          <span class="brand-tagline" id="nav-tagline">${tagline}</span>
        </div>
      </div>
      <ul class="navbar-nav" id="navbar-nav">
        ${navLinks}
        <li class="nav-sep"></li>
        <li><a href="${visitLink}" class="nav-cta" id="nav-visit" target="_blank" rel="noopener">🔗 Daftar Kunjungan</a></li>
        <li><a href="admin/login.html" class="nav-admin-link" id="nav-admin-link">🔐 Admin</a></li>
      </ul>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>`;
  },

  // ── Footer HTML ──────────────────────────────────────────
  footerHTML(settings) {
    const name  = settings.app_name || 'Lapas';
    const addr  = settings.office_address || '';
    const phone = settings.office_phone || '';
    const email = settings.office_email || '';
    const vLink = settings.external_visit_link || '#';
    const ig    = settings.socmed_instagram || '';
    const fb    = settings.socmed_facebook  || '';
    const yt    = settings.socmed_youtube   || '';
    return `
    <footer class="site-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="footer-logo-wrap">
            <img src="${settings.logo_url||'https://placehold.co/52x52/1B3A57/C9A84C?text=L'}" alt="Logo" class="footer-logo lazy" loading="lazy"/>
          </div>
          <h3 class="footer-name">${name}</h3>
          ${addr  ? `<p class="footer-info">📍 ${addr}</p>` : ''}
          ${phone ? `<p class="footer-info">📞 ${phone}</p>` : ''}
          ${email ? `<p class="footer-info">✉️ ${email}</p>` : ''}
          <div class="footer-socmed">
            ${ig ? `<a href="${ig}" target="_blank" aria-label="Instagram" class="socmed-btn">📸</a>` : ''}
            ${fb ? `<a href="${fb}" target="_blank" aria-label="Facebook"  class="socmed-btn">📘</a>` : ''}
            ${yt ? `<a href="${yt}" target="_blank" aria-label="YouTube"   class="socmed-btn">▶️</a>` : ''}
          </div>
        </div>
        <div class="footer-col">
          <h4>Navigasi</h4>
          <ul>
            <li><a href="index.html">Beranda</a></li>
            <li><a href="profil.html">Profil</a></li>
            <li><a href="berita.html">Berita & Kegiatan</a></li>
            <li><a href="layanan.html">Layanan</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Layanan</h4>
          <ul>
            <li><a href="${vLink}" target="_blank">Daftar Kunjungan</a></li>
            <li><a href="layanan.html">Penitipan Barang</a></li>
            <li><a href="layanan.html">Syarat & Ketentuan</a></li>
            <li><a href="layanan.html">Kontak</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${name}. Hak Cipta Dilindungi.</span>
        <a href="admin/login.html" class="footer-admin-link">Admin</a>
      </div>
    </footer>`;
  },

  // ── Toast ────────────────────────────────────────────────
  toastHTML() {
    return `<div id="global-toast" class="toast"></div>`;
  },

  // ── INIT ─────────────────────────────────────────────────
  async init(activePage = '') {
    this.showSplash();

    // Inject toast
    document.body.insertAdjacentHTML('beforeend', this.toastHTML());

    // Fetch settings
    const settings = await getSettings();

    // Update splash branding
    const splashName = document.getElementById('splash-name');
    const splashSub  = document.getElementById('splash-sub');
    const splashLogo = document.getElementById('splash-logo');
    const splashFill = document.getElementById('splash-fill');
    if (splashName) splashName.textContent = settings.app_name || 'LAPAS';
    if (splashSub)  splashSub.textContent  = settings.app_tagline || 'Sistem Informasi';
    if (splashLogo && settings.logo_url) splashLogo.src = settings.logo_url;

    // Animate progress bar
    let pct = 0;
    const tick = setInterval(() => {
      pct = Math.min(pct + Math.random()*18, 90);
      if (splashFill) splashFill.style.width = pct + '%';
    }, 120);

    // Inject navbar before #app
    const app = document.getElementById('app');
    if (app) {
      app.insertAdjacentHTML('beforebegin', this.navbarHTML(settings, activePage));
      app.insertAdjacentHTML('afterend',    this.footerHTML(settings));
    }

    // Set document title
    const pageTitle = document.getElementById('page-title-meta');
    if (pageTitle && settings.app_name) {
      document.title = `${pageTitle.content} — ${settings.app_name}`;
    }

    // Hamburger
    const ham = document.getElementById('hamburger');
    const nav = document.getElementById('navbar-nav');
    if (ham && nav) {
      ham.addEventListener('click', () => {
        nav.classList.toggle('open');
        ham.classList.toggle('open');
      });
    }

    // Finish splash
    clearInterval(tick);
    if (splashFill) splashFill.style.width = '100%';
    await new Promise(r => setTimeout(r, 400));
    this.hideSplash();

    // Lazy image observer
    this.initLazyImages();

    return settings;
  },

  initLazyImages() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[data-src]').forEach(img => obs.observe(img));
  }
};
