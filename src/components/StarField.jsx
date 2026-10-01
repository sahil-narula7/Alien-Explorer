import { useEffect, useRef } from 'react';

export default function StarField({ density = 200, speed = 0.3 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars with random properties
    const stars = Array.from({ length: density }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      dAlpha: (Math.random() * 0.005 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      vx: (Math.random() - 0.5) * speed * 0.1,
      vy: (Math.random() - 0.5) * speed * 0.1,
      color: ['#ffffff', '#a0c4ff', '#ffd6a5', '#caffbf'][Math.floor(Math.random() * 4)],
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Deep space gradient background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H));
      bg.addColorStop(0, '#0a0a2e');
      bg.addColorStop(0.5, '#050518');
      bg.addColorStop(1, '#000005');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Nebula cloud 1 — purple/violet tint
      const nebula1 = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.3);
      nebula1.addColorStop(0, 'rgba(100,0,200,0.07)');
      nebula1.addColorStop(0.5, 'rgba(60,0,120,0.04)');
      nebula1.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, W, H);

      // Nebula cloud 2 — blue tint
      const nebula2 = ctx.createRadialGradient(W * 0.7, H * 0.6, 0, W * 0.7, H * 0.6, W * 0.25);
      nebula2.addColorStop(0, 'rgba(0,80,200,0.06)');
      nebula2.addColorStop(0.5, 'rgba(0,40,120,0.03)');
      nebula2.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, W, H);

      // Nebula cloud 3 — teal accent
      const nebula3 = ctx.createRadialGradient(W * 0.55, H * 0.2, 0, W * 0.55, H * 0.2, W * 0.2);
      nebula3.addColorStop(0, 'rgba(0,150,150,0.05)');
      nebula3.addColorStop(1, 'transparent');
      ctx.fillStyle = nebula3;
      ctx.fillRect(0, 0, W, H);

      // Draw and animate stars
      stars.forEach(s => {
        // Twinkle
        s.alpha += s.dAlpha;
        if (s.alpha > 1 || s.alpha < 0.1) s.dAlpha *= -1;

        // Drift
        s.x += s.vx;
        s.y += s.vy;

        // Wrap around edges
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H;
        if (s.y > H) s.y = 0;

        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = s.r * 4;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [density, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
