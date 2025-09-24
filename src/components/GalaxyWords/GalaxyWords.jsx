// src/components/sections/GalaxyWords.jsx
import { useEffect, useRef } from "react";
import { GALAXY_WORDS } from "../../constants";

export default function GalaxyWords() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = canvas.clientWidth, h = 260;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.scale(DPR, DPR);

    // Reajuste en resize
    const onResize = () => {
      w = canvas.clientWidth;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.scale(DPR, DPR);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    // Estrellas
    const stars = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      s: Math.random() * 0.6 + 0.2,
    }));

    // Palabras
    const words = GALAXY_WORDS.map((t, i) => ({
      t,
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    let rafId;
    function tick() {
      ctx.clearRect(0, 0, w, h);

      // Fondo tenue
      const grad = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, Math.max(w, h));
      grad.addColorStop(0, "rgba(255,255,255,0.08)");
      grad.addColorStop(1, "rgba(255,255,255,0.00)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Estrellas
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      stars.forEach(s => {
        s.x += s.s * 0.08;
        if (s.x > w) s.x = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Palabras
      ctx.font = "600 16px system-ui, -apple-system, Segoe UI, Roboto";
      words.forEach(wd => {
        wd.x += wd.vx;
        wd.y += wd.vy;
        if (wd.x < -60) wd.x = w + 60;
        if (wd.x > w + 60) wd.x = -60;
        if (wd.y < 0) wd.y = h;
        if (wd.y > h) wd.y = 0;
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillText(wd.t, wd.x, wd.y);
      });

      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="galaxy-canvas" style={{ width: "100%", height: 260, display: "block", borderRadius: 12 }} />;
}
