/* ============================================================
   CHANDRA SEKHAR VARMA — Portfolio JS
   ============================================================
   Modules:
     1. Neural Particle Network (canvas, home page)
     2. Navbar — scroll effect, active link, hamburger
     3. Scroll-triggered fade-up animations
     4. Typewriter effect (hero role)
     5. Animated stat counters
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. NEURAL PARTICLE NETWORK
   Full-screen canvas with animated nodes + connections.
   Particles respond to mouse — nearby nodes are gently repelled.
   ══════════════════════════════════════════════════════════ */
class NeuralNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    /* Config */
    this.N          = window.innerWidth < 768 ? 55 : 110;
    this.MAX_DIST   = 155;
    this.MOUSE_R    = 170;
    this.SPEED_MAX  = 1.6;
    this.BLUE       = '10,132,255';

    this.mouse = { x: -2000, y: -2000 };
    this.rafId = null;

    this.init();
  }

  init() {
    this.resize();
    this.spawn();
    this.bindEvents();
    this.loop();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawn() {
    this.particles = [];
    for (let i = 0; i < this.N; i++) {
      this.particles.push({
        x  : Math.random() * this.canvas.width,
        y  : Math.random() * this.canvas.height,
        vx : (Math.random() - 0.5) * 0.8,
        vy : (Math.random() - 0.5) * 0.8,
        r  : Math.random() * 1.8 + 0.8,   // 0.8 – 2.6 px
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.spawn();
    }, { passive: true });

    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -2000;
      this.mouse.y = -2000;
    });
  }

  update() {
    const W = this.canvas.width, H = this.canvas.height;
    this.particles.forEach(p => {
      /* Mouse repulsion */
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const d  = Math.hypot(dx, dy);
      if (d < this.MOUSE_R && d > 0) {
        const force = ((this.MOUSE_R - d) / this.MOUSE_R) * 0.7;
        p.vx += (dx / d) * force * 0.6;
        p.vy += (dy / d) * force * 0.6;
      }

      /* Drag */
      p.vx *= 0.989;
      p.vy *= 0.989;

      /* Speed clamp */
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > this.SPEED_MAX) {
        p.vx = (p.vx / spd) * this.SPEED_MAX;
        p.vy = (p.vy / spd) * this.SPEED_MAX;
      }

      /* Move */
      p.x += p.vx;
      p.y += p.vy;

      /* Wrap edges */
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const B = this.BLUE;
    const pts = this.particles;

    /* Connections */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < this.MAX_DIST) {
          const alpha = (1 - d / this.MAX_DIST) * 0.45;
          ctx.strokeStyle = `rgba(${B},${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    /* Nodes */
    pts.forEach(p => {
      /* Outer glow */
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grd.addColorStop(0, `rgba(${B},0.18)`);
      grd.addColorStop(1, `rgba(${B},0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();

      /* Core dot */
      ctx.fillStyle = `rgba(${B},0.9)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  loop() {
    this.update();
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }
}


/* ══════════════════════════════════════════════════════════
   2. NAVBAR
   ══════════════════════════════════════════════════════════ */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const burger = document.querySelector('.hamburger');
  const mobile = document.querySelector('.nav-mobile');
  if (!navbar) return;

  /* Scroll effect */
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active link */
  const cur = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    if (
      href === cur ||
      (cur === '' && href === 'index.html') ||
      (cur === 'index.html' && href === 'index.html')
    ) a.classList.add('active');
  });

  /* Hamburger */
  if (!burger || !mobile) return;
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobile.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  mobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobile.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobile.classList.contains('open')) {
      burger.classList.remove('open');
      mobile.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ══════════════════════════════════════════════════════════
   3. SCROLL-TRIGGERED FADE-UP
   ══════════════════════════════════════════════════════════ */
(function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => io.observe(el));
})();




/* ══════════════════════════════════════════════════════════
   5. STAT COUNTER ANIMATION
   Counts up to the target number when scrolled into view.
   ══════════════════════════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);

      const el      = e.target;
      const target  = parseFloat(el.dataset.count);
      const isFloat = el.dataset.count.includes('.');
      const suffix  = el.dataset.suffix || '';
      const dur     = 1600; // ms
      const start   = performance.now();

      function frame(now) {
        const p = Math.min((now - start) / dur, 1);
        /* Ease-out */
        const eased = 1 - Math.pow(1 - p, 3);
        const val   = target * eased;
        el.textContent = (isFloat ? val.toFixed(2) : Math.round(val)) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();


/* ══════════════════════════════════════════════════════════
   6. PAGE TRANSITIONS
   Intercepts internal nav links and fades out before navigate.
   ══════════════════════════════════════════════════════════ */
(function initPageTransitions() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    /* Only handle same-origin internal .html links */
    if (!href || href.startsWith('http') || href.startsWith('mailto')
        || href.startsWith('tel') || href.startsWith('#')
        || href.startsWith('javascript') || link.hasAttribute('download')) return;

    e.preventDefault();
    document.body.classList.add('page-transition-out');
    setTimeout(() => { window.location.href = href; }, 260);
  });
})();


/* ══════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  /* Start neural network on home page only */
  if (document.getElementById('neural-canvas')) {
    new NeuralNetwork('neural-canvas');
  }
});
