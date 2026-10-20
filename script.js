'use strict';

const OPENING_WORD = '오드리';

const TRACKS = [
  { title: 'Lagu 1', src: 'assets/audio/lagu-1.mp3' },
  { title: 'Lagu 2', src: 'assets/audio/lagu-2.mp3' },
  { title: 'Lagu 3', src: 'assets/audio/lagu-3.mp3' }
];

const CONTACT = {
  instagram: 'https://www.instagram.com/dryy.sia/',
  email: 'audrymanapode@gmail.com',
  tiktok: 'https://www.tiktok.com/@adatitikkomaa?_r=1&_t=ZS-9AUC8SLNWlQ'
};

const PROJECT_LINKS = ['', '', ''];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {  } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {  } }
};

$$('[data-opening-word]').forEach(el => { el.textContent = OPENING_WORD; });

(function intro() {
  const overlay = $('#intro');
  const bar = $('#introBar');
  const count = $('#introCount');
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    overlay.classList.add('is-out');
    document.body.classList.remove('is-loading');
    setTimeout(() => document.body.classList.add('is-ready'), 500);
    setTimeout(() => overlay.classList.add('is-gone'), 1300);
  }

  const duration = reduceMotion ? 1800 : 2600;
  const start = performance.now();
  function tick(now) {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const n = Math.round(eased * 100);
    bar.style.transform = 'scaleX(' + eased + ')';
    count.textContent = String(n).padStart(3, '0');
    if (t < 1) requestAnimationFrame(tick);
    else setTimeout(finish, 350);
  }
  requestAnimationFrame(tick);
  setTimeout(finish, 6000);
})();

(function cursor() {
  const dot = $('.cursor');
  if (!dot || window.matchMedia('(pointer: coarse)').matches) return;
  let x = 0, y = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    dot.classList.add('is-on');
  });
  document.addEventListener('mouseleave', () => dot.classList.remove('is-on'));
  document.addEventListener('mouseover', e => {
    dot.classList.toggle('is-big', !!e.target.closest('a, button, .card, .tool, .logo-chip'));
  });
  (function loop() {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    dot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
    requestAnimationFrame(loop);
  })();
})();

(function nav() {
  const header = $('#siteHeader');
  const home = $('#home');
  const links = $$('.nav a');
  const toggle = $('#navToggle');
  const navPanel = $('#primaryNav');
  const mobileNav = window.matchMedia('(max-width: 800px)');

  function setMenu(open) {
    if (!toggle || !navPanel) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    navPanel.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
  }

  if (toggle && navPanel) {
    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { setMenu(false); toggle.focus(); }
    });
    document.addEventListener('click', e => {
      if (!header.contains(e.target)) setMenu(false);
    });
    mobileNav.addEventListener('change', e => { if (!e.matches) setMenu(false); });
  }

  function toggleHeader() {
    const bottom = home.getBoundingClientRect().bottom;
    header.classList.toggle('is-visible', bottom < window.innerHeight * 0.55);
  }
  window.addEventListener('scroll', toggleHeader, { passive: true });
  toggleHeader();

  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.remove('is-active'));
      const a = map.get(entry.target.id);
      if (a) a.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();

(function reveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(i => i.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach((el, i) => {

    if (el.matches('.card, .proj')) el.style.transitionDelay = ((i % 3) * 0.1) + 's';
    io.observe(el);
  });
})();

(function skew() {
  if (reduceMotion) return;
  const frame = $('#heroFrame');
  let last = window.scrollY, current = 0, running = false;
  function step() {
    const y = window.scrollY;
    const target = clamp((y - last) * 0.05, -1.2, 1.2);
    last = y;
    current += (target - current) * 0.12;
    frame.style.transform = 'skewY(' + current.toFixed(3) + 'deg)';
    if (Math.abs(current) > 0.01 || Math.abs(target) > 0.01) requestAnimationFrame(step);
    else { frame.style.transform = ''; running = false; }
  }
  window.addEventListener('scroll', () => {
    if (!running && window.scrollY < window.innerHeight * 1.5) { running = true; requestAnimationFrame(step); }
  }, { passive: true });
})();

(function photoClick() {
  const fig = $('.hero__photo');
  if (!fig) return;
  fig.addEventListener('click', e => {
    const r = fig.getBoundingClientRect();
    const ring = document.createElement('span');
    ring.className = 'hero__ripple';
    ring.style.left = (e.clientX - r.left) + 'px';
    ring.style.top = (e.clientY - r.top) + 'px';
    fig.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
    fig.classList.remove('is-click');
    void fig.offsetWidth;
    fig.classList.add('is-click');
  });
  fig.addEventListener('animationend', e => {
    if (e.target === fig.firstElementChild) fig.classList.remove('is-click');
  });
})();

(function aboutPhoto() {
  const fig = $('#aboutPhoto');
  const card = fig && $('.portrait__card', fig);
  const hit = fig && $('.portrait__hit', fig);
  if (!fig || !card || !hit) return;
  const img = $('img', card);
  const shadow = $('.portrait__shadow', card);

  const CFG = {
    MAX_X: 14,
    MAX_Y: 16,
    MAX_Z: 2.2,
    HOVER_SCALE: 1.06,
    PRESS_SCALE: 0.965,
    PRESS_TILT: 1.25,
    PHOTO_ZOOM: 0.05,
    SHIFT_X: 10,
    SHIFT_Y: 7,
    TOUCH_HOLD: 700,
    POP_SCALE: 2.6,
    POP_SWING: 480,
    POP_PHOTO: 0.55,
    REDUCED_STRENGTH: 0.6
  };

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = mq.matches;
  const onMq = e => { reduce = e.matches; };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);

  const ch = v => ({ v, vel: 0 });
  const S = { a: ch(0), rx: ch(0), ry: ch(0), rz: ch(0), wx: ch(0), wy: ch(0), s: ch(1), pz: ch(0), tx: ch(0), ty: ch(0) };
  const P = { x: 0, y: 0 };
  let hover = false, touching = false, pressed = false;
  let holdUntil = 0, last = 0, raf = 0, flashTimer = 0;

  function spring(c, target, k, damp, dt) {
    c.vel += (k * (target - c.v) - damp * c.vel) * dt;
    c.v += c.vel * dt;
  }

  function norm(e) {
    const r = fig.getBoundingClientRect();
    P.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    P.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  }

  function frame(now) {
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    last = now;
    const active = hover || touching || now < holdUntil;
    const m = reduce ? CFG.REDUCED_STRENGTH : 1;
    const k = (pressed ? CFG.PRESS_TILT : 1) * m;
    const sc = pressed ? 1 - (1 - CFG.PRESS_SCALE) * m : 1 + (CFG.HOVER_SCALE - 1) * m;

    spring(S.a, active ? 1 : 0, 120, 17, dt);
    spring(S.rx, active ? -P.y * CFG.MAX_X * k : 0, 110, 17, dt);
    spring(S.ry, active ? P.x * CFG.MAX_Y * k : 0, 110, 17, dt);
    spring(S.rz, active ? P.x * CFG.MAX_Z * m : 0, 90, 15, dt);
    spring(S.s, active ? sc : 1, 200, reduce ? 28 : 14, dt);
    spring(S.tx, active ? P.x * CFG.SHIFT_X * m : 0, 120, 16, dt);
    spring(S.ty, active ? P.y * CFG.SHIFT_Y * m : 0, 120, 16, dt);

    spring(S.wx, 0, 170, 6.5, dt);
    spring(S.wy, 0, 170, 6.5, dt);
    spring(S.pz, 0, 160, 9, dt);

    const a = clamp(S.a.v, 0, 1);
    const rx = S.rx.v + S.wx.v, ry = S.ry.v + S.wy.v;

    card.style.transform = 'rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg) rotateZ(' +
      S.rz.v.toFixed(3) + 'deg) scale(' + S.s.v.toFixed(4) + ')';

    img.style.transform = 'translate3d(' + (S.tx.v * a).toFixed(2) + 'px,' + (S.ty.v * a).toFixed(2) + 'px,0) scale(' +
      (1 + CFG.PHOTO_ZOOM * m * a + S.pz.v).toFixed(4) + ')';

    shadow.style.transform = 'translate3d(' + (-ry / CFG.MAX_Y * 12).toFixed(2) + 'px,' +
      ((rx / CFG.MAX_X) * 9 + 6 * a).toFixed(2) + 'px,-30px)';
    shadow.style.opacity = clamp(a * 0.9 + Math.abs(S.pz.v) * 2, 0, 1).toFixed(3);

    if (!active) {
      const calm = a < 0.004 && Math.abs(S.s.v - 1) < 0.0008 && Math.abs(S.s.vel) < 0.01 &&
        Math.abs(rx) < 0.03 && Math.abs(ry) < 0.03 && Math.abs(S.rz.v) < 0.03 &&
        Math.abs(S.wx.vel) < 0.3 && Math.abs(S.wy.vel) < 0.3 && Math.abs(S.pz.v) < 0.001 && Math.abs(S.pz.vel) < 0.01;
      if (calm) { rest(); return; }
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    fig.classList.add('is-active');
    card.classList.add('is-live');
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  function rest() {
    raf = 0;
    Object.keys(S).forEach(n => { S[n].vel = 0; S[n].v = 0; });
    S.s.v = 1;
    card.style.transform = '';
    img.style.transform = '';
    shadow.style.transform = '';
    shadow.style.opacity = '';
    card.classList.remove('is-live');
    fig.classList.remove('is-active');
  }

  function flash() {
    fig.classList.add('is-flash', 'has-played');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => fig.classList.remove('is-flash'), 900);
  }

  hit.addEventListener('pointerenter', e => {
    if (e.pointerType === 'touch') return;
    hover = true; norm(e); start();
  });
  hit.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' && !touching) return;
    norm(e);
    if (!raf) start();
  });
  hit.addEventListener('pointerleave', e => {
    if (e.pointerType === 'touch') return;
    hover = false; pressed = false;
  });
  hit.addEventListener('pointerdown', e => {
    fig.classList.add('has-played');
    pressed = true;
    if (e.pointerType === 'touch') touching = true;
    norm(e); start();
  });
  const release = e => {
    pressed = false;
    if (e.pointerType === 'touch' && touching) {
      touching = false;
      holdUntil = performance.now() + CFG.TOUCH_HOLD;
    }
  };
  hit.addEventListener('pointerup', release);
  hit.addEventListener('pointercancel', release);

  hit.addEventListener('click', e => {
    if (reduce) { flash(); start(); return; }
    const kb = e.detail === 0 && !e.clientX && !e.clientY;
    if (kb) { P.x = 0; P.y = 0; } else norm(e);
    const dir = Math.abs(P.x) < 0.15 ? 0.6 : P.x;
    S.s.vel += CFG.POP_SCALE;
    S.wy.vel += dir * CFG.POP_SWING;
    S.wx.vel += -P.y * CFG.POP_SWING * 0.8;
    S.pz.vel += CFG.POP_PHOTO;
    fig.classList.add('has-played');
    start();
  });

  hit.addEventListener('dragstart', e => e.preventDefault());
  window.addEventListener('blur', () => { hover = false; touching = false; pressed = false; holdUntil = 0; });
})();

(function marquee() {
  const box = $('.marquee');
  const track = $('.marquee__track');
  if (!box || !track) return;
  const SPEED = 60;
  const original = $$('.marquee__group', track);
  if (!original.length) return;

  function build() {
    $$('.marquee__group[data-clone]', track).forEach(g => g.remove());
    const w = original[0].offsetWidth;
    if (!w) return;
    const perSet = original.length;
    const need = Math.max(2, Math.ceil(box.offsetWidth / w) + 1);
    let total = perSet;
    while (total < need) {
      const c = original[total % perSet].cloneNode(true);
      c.setAttribute('data-clone', '');
      track.appendChild(c);
      total++;
    }
    const groups = $$('.marquee__group', track).length;
    track.style.setProperty('--shift', '-' + (100 / groups) + '%');
    track.style.animationDuration = (w / SPEED).toFixed(2) + 's';
  }

  build();
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  window.addEventListener('load', build);
})();

(function skillCards() {
  const cards = $$('.card');
  function toggle(card) {
    const was = card.classList.contains('is-active');
    cards.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
    if (!was) { card.classList.add('is-active'); card.setAttribute('aria-pressed', 'true'); }
  }
  cards.forEach(card => {
    card.addEventListener('click', () => toggle(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(card); }
    });
  });
})();

(function toolsMarquee() {
  const root = $('#tools');
  if (!root) return;
  const view = $('.tools__viewport', root), track = $('.tools__track', root);
  const groups = $$('.tools__group', root);
  const base = Array.from(groups[0].children);
  const SPEED = 40;
  let lastW = 0;

  function build() {
    const vw = view.clientWidth;
    groups.forEach(g => { while (g.children.length > base.length) g.removeChild(g.lastChild); });
    let guard = 0;
    while (groups[0].scrollWidth < vw + 40 && guard++ < 6) {
      groups.forEach(g => base.forEach(el => {
        const c = el.cloneNode(true);
        c.removeAttribute('tabindex'); c.removeAttribute('role'); c.removeAttribute('aria-pressed');
        c.classList.remove('is-active');
        g.appendChild(c);
      }));
    }
    const w = groups[0].getBoundingClientRect().width;
    if (w) { track.style.setProperty('--dur', (w / SPEED).toFixed(1) + 's'); lastW = vw; }
  }

  function select(el) {
    $$('.tool.is-active', root).forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-pressed', 'false'); });
    el.classList.add('is-active'); el.setAttribute('aria-pressed', 'true');
  }
  root.addEventListener('click', e => { const t = e.target.closest('.tool'); if (t) select(t); });
  root.addEventListener('keydown', e => {
    const t = e.target.closest('.tool');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(t); }
  });

  const resume = () => view.classList.remove('is-paused');
  view.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') view.classList.add('is-paused'); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
    view.addEventListener(ev, e => { if (e.pointerType !== 'mouse') resume(); }));

  build();
  window.addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (Math.abs(view.clientWidth - lastW) > 40) build(); }, 200);
  });
})();

(function principle() {
  const p = $('#quote p');
  if (!p) return;
  const words = p.textContent.trim().split(/\s+/);
  p.textContent = '';
  const spans = words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'quote__w';
    s.textContent = w;
    p.appendChild(s);
    if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
    return s;
  });

  function update() {
    const r = p.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = clamp((vh * 0.85 - r.top) / (vh * 0.5), 0, 1);
    spans.forEach((s, i) => {
      s.style.opacity = (0.15 + 0.85 * clamp(progress * (spans.length + 2) - i, 0, 1)).toFixed(3);
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

(function projectVisuals() {
  $$('.projects [data-project-visual]').forEach(visual => {
    visual.addEventListener('pointerdown', e => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') visual.classList.add('is-pressed');
    });
    const release = () => visual.classList.remove('is-pressed');
    visual.addEventListener('pointerup', release);
    visual.addEventListener('pointercancel', release);
    visual.addEventListener('pointerleave', release);
  });

  const cloud = $('.projects [data-cloud-carousel]');
  if (!cloud) return;
  const slides = $$('.proj__image--cloud', cloud);
  const counter = $('.proj__image-count', cloud);
  if (slides.length < 2) return;

  let active = Math.max(0, slides.findIndex(img => img.classList.contains('is-active')));
  let lastHoverChange = 0;
  function showSlide(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((img, i) => {
      img.classList.toggle('is-active', i === active);
      img.setAttribute('aria-hidden', i === active ? 'false' : 'true');
    });
    cloud.setAttribute('aria-pressed', active === 1 ? 'true' : 'false');
    if (counter) counter.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
  }
  function nextSlide() { showSlide(active + 1); }

  cloud.addEventListener('pointerenter', e => {
    if (e.pointerType === 'touch') return;
    const now = performance.now();
    if (now - lastHoverChange < 250) return;
    lastHoverChange = now;
    nextSlide();
  });
  cloud.addEventListener('click', e => {
    nextSlide();
  });
  cloud.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    }
  });
  showSlide(active);
})();

(function contact() {
  function setup(id, value, isMail) {
    const a = document.getElementById(id);
    if (!a) return;
    if (value) {
      a.href = isMail && !/^mailto:/i.test(value) ? 'mailto:' + value : value;
      if (!isMail) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.removeAttribute('title');
    } else {
      a.title = a.dataset.placeholder + ' belum diisi (edit CONTACT di script.js)';
      a.setAttribute('aria-disabled', 'true');
      a.addEventListener('click', e => e.preventDefault());
    }
  }
  setup('linkInstagram', CONTACT.instagram, false);
  setup('linkEmail', CONTACT.email, true);
  setup('linkTiktok', CONTACT.tiktok, false);

  $('#toTop').addEventListener('click', e => {
    e.preventDefault();
    const home = $('#home');
    if (home) home.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

(function settings() {
  const root = document.documentElement;
  const panel = $('#panel');

  const pops = [
    { btn: $('#musicBtn'), pop: $('#musicPop') },
    { btn: $('#paletteBtn'), pop: $('#palettePop') }
  ];
  function closeAll(except) {
    pops.forEach(p => {
      if (p === except) return;
      p.pop.hidden = true;
      p.btn.setAttribute('aria-expanded', 'false');
    });
  }
  pops.forEach(p => {
    p.btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = p.pop.hidden;
      closeAll(p);
      p.pop.hidden = !open;
      p.btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', e => { if (!panel.contains(e.target)) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  const DEFAULT_COLOR = '#ffb9cb';
  const swatches = $$('.swatch');
  function applyColor(c) {
    root.style.setProperty('--font-color', c);
    swatches.forEach(s => s.classList.toggle('is-selected', s.dataset.color.toLowerCase() === c.toLowerCase()));
  }
  const savedColor = store.get('audri-color');
  applyColor(swatches.some(s => s.dataset.color === savedColor) ? savedColor : DEFAULT_COLOR);
  swatches.forEach(s => s.addEventListener('click', () => {
    applyColor(s.dataset.color);
    store.set('audri-color', s.dataset.color);
  }));
  $('#resetColor').addEventListener('click', () => {
    applyColor(DEFAULT_COLOR);
    store.del('audri-color');
  });

  const audio = $('#player');
  const list = $('#trackList');
  const status = $('#musicStatus');
  const playBtn = $('#playPause');
  const musicBtn = $('#musicBtn');
  let current = 0;
  let errorShown = false;
  audio.loop = true;

  TRACKS.forEach((t, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'track';
    b.innerHTML = '<span class="track__n">' + String(i + 1).padStart(2, '0') + '</span><span></span>';
    b.lastChild.textContent = t.title;
    b.addEventListener('click', () => { select(i); play(); });
    li.appendChild(b);
    list.appendChild(li);
  });
  const trackBtns = $$('.track', list);

  function setStatus(msg, isErr) {
    status.textContent = msg;
    status.classList.toggle('is-error', !!isErr);
  }
  function select(i) {
    current = i;
    errorShown = false;
    audio.src = TRACKS[i].src;
    trackBtns.forEach((b, k) => b.classList.toggle('is-current', k === i));
  }
  function missing() {
    if (errorShown) return;
    errorShown = true;
    musicBtn.classList.remove('is-playing');
    playBtn.textContent = 'Putar';
    setStatus('File belum ada. Tambahkan: ' + TRACKS[current].src, true);
  }
  function play() {
    if (!audio.src) select(current);
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {
      if (audio.error) {
        missing();
      } else {
        musicBtn.classList.remove('is-playing');
        playBtn.textContent = 'Putar';
        setStatus('Tidak dapat memutar file audio. Periksa path dan format file.', true);
      }
    });
  }
  audio.addEventListener('playing', () => {
    musicBtn.classList.add('is-playing');
    playBtn.textContent = 'Jeda';
    setStatus('Memutar: ' + TRACKS[current].title, false);
  });
  audio.addEventListener('pause', () => {
    musicBtn.classList.remove('is-playing');
    playBtn.textContent = 'Putar';
    if (!errorShown) setStatus('Dijeda: ' + TRACKS[current].title, false);
  });
  audio.addEventListener('error', missing);
  playBtn.addEventListener('click', () => {
    if (!audio.src) select(current);
    if (audio.paused) play(); else audio.pause();
  });
  trackBtns[0].classList.add('is-current');
})();
