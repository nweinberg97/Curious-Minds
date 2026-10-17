/**
 * A tiny confetti burst on a full-screen canvas. No library.
 * Skipped entirely when the player prefers reduced motion.
 */
const COLORS = ['#ff5fa8', '#ffc93c', '#ff8a3d', '#a8e063', '#45d4f5', '#6e8bff', '#b98cff', '#fff4e0'];

function reduced(): boolean {
  const m = document.documentElement.dataset.motion;
  if (m === 'reduced') return true;
  if (m === 'full') return false;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// A burst belongs to the screen it celebrated: clear it when the player moves on.
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => document.querySelectorAll('canvas.confetti').forEach((c) => c.remove()));
}

interface Bit { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; c: string; life: number }

export function confetti(opts: { x?: number; y?: number; count?: number; spread?: number } = {}) {
  if (typeof document === 'undefined' || reduced()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  canvas.setAttribute('aria-hidden', 'true');
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.remove();
  ctx.scale(dpr, dpr);
  const ox = opts.x ?? innerWidth / 2;
  const oy = opts.y ?? innerHeight * 0.35;
  const spread = opts.spread ?? 1;
  const bits: Bit[] = Array.from({ length: opts.count ?? 90 }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1 * spread;
    const v = 7 + Math.random() * 9;
    return {
      x: ox, y: oy,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      w: 6 + Math.random() * 7, h: 4 + Math.random() * 5,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
    };
  });
  let frame = 0;
  const tick = () => {
    if (!canvas.isConnected) return;
    frame++;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const b of bits) {
      b.vy += 0.32;
      b.vx *= 0.985;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      if (b.y < innerHeight + 20) alive++;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.r);
      ctx.fillStyle = b.c;
      ctx.strokeStyle = '#0b0620';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
    if (alive && frame < 260) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}

/** Confetti from the middle of an element. */
export function confettiFrom(el: Element | null, count = 60) {
  if (!el) return confetti({ count });
  const r = el.getBoundingClientRect();
  confetti({ x: r.left + r.width / 2, y: r.top + r.height / 2, count, spread: 0.9 });
}
