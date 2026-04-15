/* ════════════════════════════════════════════════════════
   script.js — Portfolio of MD Rakibul Islam Shanto
   Three.js + Cursor Trail + Typewriter + Scroll Reveal
════════════════════════════════════════════════════════ */

'use strict';

/* ────────────────────────────────────────────────────
   1. THREE.JS  — Particle Field + Floating Shapes
──────────────────────────────────────────────────── */
(function initThree() {
  const canvas   = document.getElementById('bg-canvas');
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  /* ── Particles ── */
  const COUNT = window.innerWidth < 768 ? 1500 : 3000;
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);

  // Cyan = [0, 0.831, 1]   Violet = [0.486, 0.231, 0.929]
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    pos[i3]   = (Math.random() - .5) * 110;
    pos[i3+1] = (Math.random() - .5) * 110;
    pos[i3+2] = (Math.random() - .5) * 60;

    const t = Math.random();
    if (t < .45) {
      col[i3] = 0; col[i3+1] = .831; col[i3+2] = 1;        // cyan
    } else if (t < .8) {
      col[i3] = .486; col[i3+1] = .231; col[i3+2] = .929;  // violet
    } else {
      col[i3] = 0; col[i3+1] = 1; col[i3+2] = .53;         // green
    }
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const pMat = new THREE.PointsMaterial({
    size: 0.14, vertexColors: true,
    transparent: true, opacity: .75,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Lights ── */
  scene.add(new THREE.AmbientLight(0xffffff, .5));
  const ptA = new THREE.PointLight(0x00d4ff, 1.2, 120);
  ptA.position.set(20, 20, 20);
  scene.add(ptA);
  const ptB = new THREE.PointLight(0x7c3aed, 1.2, 120);
  ptB.position.set(-20, -20, 20);
  scene.add(ptB);

  /* ── Wireframe helper ── */
  function makeShape(geo, color, x, y, z) {
    const mat  = new THREE.MeshPhongMaterial({ color, wireframe: true, transparent: true, opacity: .55 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  const icosa = makeShape(new THREE.IcosahedronGeometry(2.4, 0),  0x00d4ff,  17,  6, -8);
  const torus = makeShape(new THREE.TorusGeometry(2.2, .55, 14, 48), 0x7c3aed, -18, -7, -10);
  const octa  = makeShape(new THREE.OctahedronGeometry(2.2, 0),   0x00ff88,   7, -16, -12);

  /* ── Mouse parallax ── */
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth  - .5) * 2;
    my = (e.clientY / innerHeight - .5) * 2;
  });

  /* ── Animation loop ── */
  const clock = new THREE.Clock();

  (function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();

    tx += (mx - tx) * .04;
    ty += (my - ty) * .04;

    // Particle cloud: gentle drift + mouse tilt
    particles.rotation.y  =  tx * .25 + t * .0004 * 60;
    particles.rotation.x  = -ty * .18;

    // Shapes: orbit + bob
    icosa.rotation.x = t * .28; icosa.rotation.y = t * .19;
    icosa.position.y = 6 + Math.sin(t * .5) * 2;

    torus.rotation.x = t * .15; torus.rotation.y = t * .35;
    torus.position.y = -7 + Math.sin(t * .4 + 1) * 1.8;

    octa.rotation.x  = t * .38; octa.rotation.z  = t * .26;
    octa.position.y  = -16 + Math.sin(t * .55 + 2) * 1.6;

    // Camera subtle follow
    camera.position.x = tx * 2.5;
    camera.position.y = -ty * 2;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();


/* ────────────────────────────────────────────────────
   2. CURSOR TRAIL
──────────────────────────────────────────────────── */
(function initCursorTrail() {
  // Skip on touch-primary devices
  if (window.matchMedia('(pointer:coarse)').matches) return;

  const cvs = document.getElementById('cursor-canvas');
  const ctx = cvs.getContext('2d');

  function resize() { cvs.width = innerWidth; cvs.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const trail = [];
  const MAX   = 22;
  let cx = -200, cy = -200;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    trail.push({ x: cx, y: cy });
    if (trail.length > MAX) trail.shift();
  });

  (function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // Dot trail
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      const ratio = i / (trail.length - 1);
      const r = ratio * 5;
      const a = ratio * .55;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${a})`;
      ctx.fill();
    }

    // Glow halo at cursor tip
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    g.addColorStop(0, 'rgba(0,212,255,.3)');
    g.addColorStop(1, 'rgba(0,212,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  })();
})();


/* ────────────────────────────────────────────────────
   3. TYPEWRITER
──────────────────────────────────────────────────── */
(function initTypewriter() {
  const el      = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Technical Support Engineer',
    'Shopify Apps Specialist',
    'Frontend DevTools Debugger',
    'AI Project Builder',
    'Problem Solver & Mentor'
  ];
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    el.textContent = phrase.substring(0, ci);

    let delay = deleting ? 45 : 95;

    if (!deleting && ci === phrase.length) {
      delay = 2200;
      deleting = true;
    } else if (deleting && ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      delay = 400;
    }

    deleting ? ci-- : ci++;
    setTimeout(tick, delay);
  }
  tick();
})();


/* ────────────────────────────────────────────────────
   4. NAVBAR  (scroll style + hamburger + active link)
──────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const navLinks  = document.querySelectorAll('.nav-links a');
  const sections  = document.querySelectorAll('section[id]');

  // Scroll-based class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    highlightActive();
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileLinks.forEach(l => l.addEventListener('click', closeMenu));
  // Close on outside click
  mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) closeMenu(); });

  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Active section highlight
  function highlightActive() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }
  highlightActive();
})();


/* ────────────────────────────────────────────────────
   5. SCROLL REVEAL  (IntersectionObserver)
──────────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  // Stagger children of grid/list parents
  document.querySelectorAll('.projects-grid, .contact-grid, .vol-grid, .stats-grid').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => obs.observe(el));
})();


/* ────────────────────────────────────────────────────
   6. SKILL PROGRESS BARS
──────────────────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.bar-fill');
  const obs  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = e.target.dataset.w + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => obs.observe(b));
})();


/* ────────────────────────────────────────────────────
   7. CIRCULAR ACCURACY CHARTS  (SVG stroke-dasharray)
──────────────────────────────────────────────────── */
(function initCircles() {
  const fills = document.querySelectorAll('.acc-fill');
  const obs   = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const val = parseFloat(e.target.dataset.val);
        e.target.style.strokeDasharray = `${val}, 100`;
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  fills.forEach(f => obs.observe(f));
})();


/* ────────────────────────────────────────────────────
   8. VANILLA TILT on project cards
──────────────────────────────────────────────────── */
(function initTilt() {
  if (typeof VanillaTilt === 'undefined') return;
  if (window.matchMedia('(pointer:coarse)').matches) return; // skip touch
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    max: 8, speed: 400, glare: true, 'max-glare': 0.2,
    scale: 1.02, gyroscope: false
  });
})();


/* ────────────────────────────────────────────────────
   9. SMOOTH SCROLL for anchor links
──────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 72; // navbar height
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});
