/* ==============================================================
   LEVIATHAN NUTRITION — particles.js
   Sistema de partículas ambientales (humo / polvo / luces) sobre
   un <canvas> a pantalla completa. Usa requestAnimationFrame y se
   pausa automáticamente si la pestaña no está visible, para
   mantener un rendimiento fluido en equipos de gama media.
================================================================= */

(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let particles = [];
  let rafId = null;
  let isVisible = true;

  const DENSITY = 1 / 24000;
  const MAX_PARTICLES = 80;

  const COLORS = [
    'rgba(30,155,255,ALPHA)',
    'rgba(95,212,255,ALPHA)',
    'rgba(57,255,138,ALPHA)',
  ];

  function pickColor() {
    const r = Math.random();
    if (r < 0.55) return COLORS[0];
    if (r < 0.9) return COLORS[1];
    return COLORS[2];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  }

  function buildParticles() {
    const count = Math.min(MAX_PARTICLES, Math.floor(width * height * DENSITY));
    particles = new Array(count).fill(0).map(createParticle);
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      baseAlpha: Math.random() * 0.5 + 0.15,
      speedY: Math.random() * 0.18 + 0.04,
      speedX: (Math.random() - 0.5) * 0.12,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.004 + 0.001,
      color: pickColor(),
      twinkle: Math.random() * Math.PI * 2,
    };
  }

  function step() {
    if (!isVisible) { rafId = requestAnimationFrame(step); return; }

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.drift += p.driftSpeed;
      p.y -= p.speedY;
      p.x += p.speedX + Math.sin(p.drift) * 0.15;
      p.twinkle += 0.02;

      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.fillStyle = p.color.replace('ALPHA', alpha.toFixed(3));
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(step);
  }

  function start() {
    if (rafId) return;
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  document.addEventListener('visibilitychange', () => {
    isVisible = document.visibilityState === 'visible';
  });

  window.addEventListener('resize', resize);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  resize();
  if (!prefersReducedMotion) {
    start();
  } else {
    step();
    stop();
  }
})();
