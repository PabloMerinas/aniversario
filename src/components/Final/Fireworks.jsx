import { useRef, useEffect } from "react";

function randomColor() {
  const colors = ["#FFD700", "#FF69B4", "#00BFFF", "#ADFF2F", "#FF4500", "#FFFFFF"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function Fireworks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    }
    window.addEventListener("resize", resize);

    // Firework particle system
    let fireworks = [];
    function spawnFirework() {
      const x = Math.random() * W * 0.8 + W * 0.1;
      const y = Math.random() * H * 0.5 + H * 0.2;
      const color = randomColor();
      const particles = [];
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 * i) / 40;
        const speed = Math.random() * 3 + 2;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
        });
      }
      fireworks.push({ particles });
    }

    let lastSpawn = 0;
    function animate(ts) {
      ctx.clearRect(0, 0, W, H);
      if (ts - lastSpawn > 800) {
        spawnFirework();
        lastSpawn = ts;
      }
      fireworks.forEach((fw) => {
        fw.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.03; // gravity
          p.alpha -= 0.015;
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });
      });
      fireworks = fireworks.filter(fw =>
        fw.particles.some(p => p.alpha > 0)
      );
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}

export default Fireworks;