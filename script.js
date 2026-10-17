/* =========================================================
   Universidad Libre — Rediseño de inicio (patrón harvard.edu)
   JavaScript sin dependencias. El contenido es HTML estático:
   la página se puede leer completa aunque el script no cargue.
   ========================================================= */
(function () {
  'use strict';

  const BASE = 'https://www.unilibre.edu.co';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;

  /* ---------- Preferencias de accesibilidad ---------- */
  const store = {
    get: k => { try { return localStorage.getItem('ul-' + k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem('ul-' + k, v); } catch (e) {} },
    del: k => { try { localStorage.removeItem('ul-' + k); } catch (e) {} }
  };
  const TOGGLES = [['opt-contrast', 'contrast', 'high'], ['opt-motion', 'motion', 'reduce'], ['opt-links', 'links', 'underline']];

  function applyPrefs() {
    const font = store.get('font') || '0';
    root.dataset.font = font;
    $$('[data-font]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.font === font)));
    TOGGLES.forEach(([id, key, val]) => {
      const on = store.get(key) === val;
      if (on) root.dataset[key] = val; else delete root.dataset[key];
      const el = document.getElementById(id);
      if (el) el.checked = on;
    });
    syncVideo();
  }

  function initA11y() {
    const btn = $('#a11y-toggle'), panel = $('#a11y-panel');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      if (!open) $('button, input', panel).focus();
    });
    $$('[data-font]').forEach(b => b.addEventListener('click', () => { store.set('font', b.dataset.font); applyPrefs(); }));
    TOGGLES.forEach(([id, key, val]) => {
      const el = document.getElementById(id);
      el.addEventListener('change', () => { el.checked ? store.set(key, val) : store.del(key); applyPrefs(); });
    });
    $('#a11y-reset').addEventListener('click', () => { ['font', 'contrast', 'motion', 'links'].forEach(store.del); applyPrefs(); });
  }

  /* ---------- Menú a pantalla completa ---------- */
  function initMenu() {
    const dialog = $('#menu'), openBtn = $('#menu-open'), body = $('.menu__body', dialog);
    const items = $$('.menu__item', dialog);
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const select = item => {
      items.forEach(i => {
        const on = i === item;
        i.setAttribute('aria-expanded', String(on));
        document.getElementById(i.getAttribute('aria-controls')).hidden = !on;
      });
    };

    openBtn.addEventListener('click', () => {
      body.classList.remove('is-detail');
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      items.find(i => i.getAttribute('aria-expanded') === 'true').focus();
    });
    $('#menu-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; openBtn.focus(); });

    items.forEach((item, idx) => {
      item.addEventListener('click', () => {
        select(item);
        body.classList.add('is-detail'); // en móvil muestra el panel en lugar de la lista
        if (window.matchMedia('(max-width: 960px)').matches) {
          $('.menu__back', document.getElementById(item.getAttribute('aria-controls'))).focus();
        }
      });
      item.addEventListener('keydown', e => {
        const dir = { ArrowDown: 1, ArrowUp: -1 }[e.key];
        if (!dir) return;
        e.preventDefault();
        items[(idx + dir + items.length) % items.length].focus();
      });
    });

    $$('.menu__back', dialog).forEach(b => b.addEventListener('click', () => {
      body.classList.remove('is-detail');
      items.find(i => i.getAttribute('aria-expanded') === 'true').focus();
    }));
  }

  /* ---------- Búsqueda con accesos directos ---------- */
  const INDEX = [
    ['Pregrados', 'Estudia', '/pregrados/'], ['Posgrados', 'Estudia', '/posgrados/'],
    ['Programas virtuales', 'Estudia', '/programas-virtuales/'], ['Educación continua', 'Estudia', '/educacion-continua/'],
    ['Inscripciones', 'Aspirantes', '/aspirantes/'], ['Financiación', 'Aspirantes', '/financiacion'],
    ['Derechos pecuniarios', 'Aspirantes', '/derechos-pecuniarios/'],
    ['Admisiones y registro', 'Servicios', '/admisiones-y-registro/'], ['Bienestar universitario', 'Servicios', '/bienestar-universitario/'],
    ['Biblioteca', 'Servicios', '/biblioteca'], ['Servicios TIC', 'Servicios', '/servicios-tic/'],
    ['Consultorios', 'Servicios', '/consultorios-y-unidades-de-proyeccion-social/'],
    ['SIUL', 'Plataformas', 'https://siul.unilibre.edu.co/sinugwt/'], ['Campus virtual', 'Plataformas', '/campus-virtual/'],
    ['Pagos en línea PSE', 'Plataformas', '/pasarelas-de-pago-pse/'], ['Correo institucional', 'Plataformas', 'https://outlook.office.com'],
    ['Facultades', 'La Universidad', '/facultades'], ['Historia', 'La Universidad', '/sobre-la-universidad-libre/'],
    ['Directorio institucional', 'La Universidad', '/directorio-institucional/'], ['Normativa', 'La Universidad', '/normativas/'],
    ['Centro de Lenguas Extranjeras', 'La Universidad', '/cleul/'], ['Investigación', 'Investigación', '/investigacion'],
    ['Revistas', 'Investigación', 'https://revistas.unilibre.edu.co/'], ['Internacionalización', 'Vida universitaria', '/internacionalizacion/'],
    ['Emisora Centenario', 'Vida universitaria', '/emisora-centenario/'], ['Noticias', 'Actualidad', '/noticias'],
    ['Eventos', 'Actualidad', '/eventos/'], ['PQRSF', 'Atención', 'https://www.kawak.com.co/unilibre/pqrs/pqrs_index.php'],
    ['Transparencia', 'Atención', '/transparencia-y-acceso-a-la-informacion-publica/'], ['Egresados', 'Perfiles', '/egresados/'],
    ['Estudiantes', 'Perfiles', '/estudiantes/'], ['Profesores', 'Perfiles', '/profesores/'],
    ['Seccional Bogotá', 'Seccionales', '/bogota'], ['Seccional Barranquilla', 'Seccionales', '/barranquilla'],
    ['Seccional Cali', 'Seccionales', '/cali'], ['Seccional Pereira', 'Seccionales', '/pereira'],
    ['Seccional Cúcuta', 'Seccionales', '/cucuta'], ['Seccional Cartagena', 'Seccionales', '/cartagena'],
    ['Seccional El Socorro', 'Seccionales', '/socorro']
  ];
  const DEFAULTS = ['Inscripciones', 'SIUL', 'Pagos en línea PSE', 'Campus virtual', 'Admisiones y registro'];
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const abs = u => (u.startsWith('http') ? u : BASE + u);

  function initSearch() {
    const dialog = $('#search'), input = $('#search-input'), list = $('#search-results'), openBtn = $('#search-open');
    if (!dialog || typeof dialog.showModal !== 'function') {
      openBtn.addEventListener('click', () => { location.href = BASE + '/?s='; });
      return;
    }
    const render = q => {
      const n = norm(q.trim());
      const rows = n ? INDEX.filter(([l, c]) => norm(l).includes(n) || norm(c).includes(n)).slice(0, 8)
                     : INDEX.filter(([l]) => DEFAULTS.includes(l));
      list.replaceChildren();
      if (!rows.length) {
        const li = document.createElement('li');
        li.className = 'search__hint';
        li.textContent = `No hay accesos directos para “${q}”. Presiona Buscar para consultar todo el sitio.`;
        list.append(li);
        return;
      }
      rows.forEach(([label, cat, url]) => {
        const li = document.createElement('li'), a = document.createElement('a');
        const s = document.createElement('span'), sm = document.createElement('small');
        a.href = abs(url); s.textContent = label; sm.textContent = cat;
        a.append(s, sm); li.append(a); list.append(li);
      });
    };
    openBtn.addEventListener('click', () => { dialog.showModal(); input.value = ''; render(''); input.focus(); });
    $('#search-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => openBtn.focus());
    input.addEventListener('input', () => render(input.value));
    dialog.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const links = $$('a', list);
      if (!links.length) return;
      e.preventDefault();
      const i = links.indexOf(document.activeElement);
      links[e.key === 'ArrowDown' ? (i + 1) % links.length : (i <= 0 ? links.length - 1 : i - 1)].focus();
    });
    document.addEventListener('keydown', e => {
      const typing = /input|textarea|select/i.test(document.activeElement.tagName);
      if (e.key === '/' && !typing && !dialog.open && !$('#menu').open) { e.preventDefault(); openBtn.click(); }
    });
  }

  /* ---------- Navegación entre seccionales (resalta la visible) ---------- */
  function initRegionNav() {
    const links = $$('.region-nav a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.removeAttribute('aria-current'));
        const a = byId.get(en.target.id);
        if (a) {
          a.setAttribute('aria-current', 'true');
          a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Video del hero (si se agrega): pausa accesible ---------- */
  function syncVideo() {
    const v = $('.hero__video');
    if (!v) return;
    const reduce = root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) v.pause();
  }
  function initVideo() {
    const v = $('.hero__video'), btn = $('#hero-pause');
    if (!v || !btn) return;
    btn.hidden = false;
    const label = () => {
      btn.textContent = v.paused ? 'Reproducir video' : 'Pausar video';
      btn.setAttribute('aria-pressed', String(v.paused));
    };
    btn.addEventListener('click', () => { v.paused ? v.play() : v.pause(); label(); });
    v.addEventListener('play', label); v.addEventListener('pause', label);
    syncVideo(); label();
  }

  /* ---------- Volver arriba ---------- */
  function initToTop() {
    const btn = $('#to-top');
    const onScroll = () => { btn.hidden = scrollY < 1000; };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', e => {
      e.preventDefault();
      scrollTo({ top: 0, behavior: root.dataset.motion === 'reduce' ? 'auto' : 'smooth' });
      $('.skip-link').focus({ preventScroll: true });
    });
  }

  /* ---------- Imágenes: si una remota falla, se muestra el fondo de marca ---------- */
  function initImages() {
    $$('.media > img').forEach(img => {
      const mark = () => img.parentElement.classList.add('is-broken');
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) mark();
      img.addEventListener('error', mark, { once: true });
    });
  }

  applyPrefs();
  initImages();
  initA11y();
  initMenu();
  initSearch();
  initRegionNav();
  initVideo();
  initToTop();
})();
