// Tiny dependency-free confetti burst on a temporary full-screen canvas.
// Cross-browser (canvas + requestAnimationFrame). No-op if motion is reduced.

const COLORS = ["#e0492a", "#0e7c70", "#d9982f", "#7a3b6b", "#2f6f9e"];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
}

export function celebrate(count = 120): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  const W = window.innerWidth;
  const H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const pieces: Piece[] = Array.from({ length: count }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.3,
    y: H * 0.35 + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -14 - 4,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    size: 6 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  const start = performance.now();
  const DURATION = 2200;

  function frame(now: number) {
    const elapsed = now - start;
    ctx!.clearRect(0, 0, W, H);
    for (const p of pieces) {
      p.vy += 0.3; // gravity
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = Math.max(0, 1 - elapsed / DURATION);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    }
    if (elapsed < DURATION) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}
