// src/components/GalaxyWords/WordGalaxy.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { GALAXY_WORDS } from "../../config/constants";

/**
 * WordGalaxy (parallax + anillos) — SOLO ARRASTRAR
 * - Starfield en <canvas> fullscreen.
 * - Sistema solar centrado y responsivo (auto-calculado).
 * - Los anillos giran sobre sí mismos.
 * - El texto mira a cámara (siempre de frente).
 * - Captura pointer/touch para que no haya clics por debajo.
 * - Aparición suave al montar (fade-in).
 */
export default function WordGalaxy() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  // Aparición suave
  const [appear, setAppear] = useState(false);

  // ===== viewport =====
  const [vw, setVw] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 800));
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 600));

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // activar fade-in en el siguiente frame
  useEffect(() => {
    const id = requestAnimationFrame(() => setAppear(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ===== tamaño del sistema según pantalla (auto) =====
  const S = useMemo(() => {
    const short = Math.min(vw, vh);
    const factor = vw < 640 ? 0.9 : 0.72; // móvil vs desktop
    const s = Math.round(short * factor);
    return Math.max(280, Math.min(s, 820));
  }, [vw, vh]);

  // ===== rings config =====
  const ringConfigs = useMemo(
    () => [
      { r: 0.28, tilt: 12,  period: 16, z: -90  },
      { r: 0.44, tilt: -8,  period: 24, z: -10  },
      { r: 0.62, tilt: 16,  period: 32, z:  70  },
      { r: 0.78, tilt: -14, period: 44, z: 160  },
    ],
    []
  );

  // ===== palabras por anillos =====
  const rings = useMemo(() => {
    const words = (GALAXY_WORDS?.length ? GALAXY_WORDS : [
      "Amor","Risas","Aventuras","Confianza","Café","Abrazos",
      "Playlist","Nosotros","Sueños","Tú","Besitos","Viajes",
      "Complicidad","Ilusiones","Caricias","Detalles"
    ]).slice(0, 48);
    const buckets = ringConfigs.map(() => []);
    words.forEach((w, i) => buckets[i % buckets.length].push(w));
    return buckets;
  }, [ringConfigs]);

  // ===== parallax solo mientras se ARRASTRA =====
  const dragging = useRef(false);
  const rafId = useRef(0);
  const par = useRef({ nx: 0, ny: 0 }); // -1..1

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    const apply = () => {
      root.style.setProperty("--tiltX", `${(-par.current.ny * 10).toFixed(3)}deg`);
      root.style.setProperty("--tiltY", `${( par.current.nx * 12).toFixed(3)}deg`);
      rafId.current = 0;
    };

    const handlePos = (x, y) => {
      const rect = root.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      par.current.nx = clamp((x - cx) / (rect.width / 2), -1, 1);
      par.current.ny = clamp((y - cy) / (rect.height / 2), -1, 1);
      if (!rafId.current) rafId.current = requestAnimationFrame(apply);
    };

    // Handlers: SOLO arrastrando
    const onMouseDown  = (e) => { dragging.current = true; e.preventDefault(); e.stopPropagation(); };
    const onMouseMove  = (e) => { if (!dragging.current) return; handlePos(e.clientX, e.clientY); e.preventDefault(); e.stopPropagation(); };
    const onMouseUp    = (e) => { dragging.current = false; e.preventDefault(); e.stopPropagation(); };
    const onMouseLeave = (e) => { dragging.current = false; e.preventDefault(); e.stopPropagation(); };

    const onTouchStart = (e) => { dragging.current = true; const t = e.touches[0]; if (t) handlePos(t.clientX, t.clientY); e.preventDefault(); e.stopPropagation(); };
    const onTouchMove  = (e) => { if (!dragging.current) return; const t = e.touches[0]; if (t) handlePos(t.clientX, t.clientY); e.preventDefault(); e.stopPropagation(); };
    const onTouchEnd   = (e) => { dragging.current = false; e.preventDefault(); e.stopPropagation(); };

    // Bloquear clicks/taps (incl. click sintético tras touch)
    const blockClick = (e) => { e.preventDefault(); e.stopPropagation(); };

    root.addEventListener("mousedown", onMouseDown,  { passive: false });
    root.addEventListener("mousemove", onMouseMove,  { passive: false });
    root.addEventListener("mouseup",   onMouseUp,    { passive: false });
    root.addEventListener("mouseleave",onMouseLeave, { passive: false });

    root.addEventListener("touchstart", onTouchStart, { passive: false });
    root.addEventListener("touchmove",  onTouchMove,  { passive: false });
    root.addEventListener("touchend",   onTouchEnd,   { passive: false });
    root.addEventListener("touchcancel",onTouchEnd,   { passive: false });

    root.addEventListener("click", blockClick, true); // captura

    return () => {
      root.removeEventListener("mousedown", onMouseDown);
      root.removeEventListener("mousemove", onMouseMove);
      root.removeEventListener("mouseup", onMouseUp);
      root.removeEventListener("mouseleave", onMouseLeave);

      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);

      root.removeEventListener("click", blockClick, true);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // ===== STARFIELD en canvas =====
  useEffect(() => {
    const cnv = canvasRef.current;
    if (!cnv) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cnv.width = Math.round(vw * dpr);
    cnv.height = Math.round(vh * dpr);
    cnv.style.width = `${vw}px`;
    cnv.style.height = `${vh}px`;

    const ctx = cnv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const base = Math.sqrt((vw * vh) / (1280 * 720));
    const layers = [
      { count: Math.min(350 * base, 450), shift: 120, size: [0.6, 1.6], alpha:[0.35, 0.7] },
      { count: Math.min(230 * base, 320), shift: 80,  size: [0.7, 1.9], alpha:[0.45, 0.8] },
      { count: Math.min(140 * base, 220), shift: 45,  size: [0.9, 2.2], alpha:[0.55, 0.9] },
    ];

    const stars = [];
    layers.forEach(L => {
      for (let i = 0; i < Math.round(L.count); i++) {
        stars.push({
          x: Math.random() * vw,
          y: Math.random() * vh,
          s: L.size[0] + Math.random() * (L.size[1] - L.size[0]),
          a: L.alpha[0] + Math.random() * (L.alpha[1] - L.alpha[0]),
          shift: L.shift,
          tw: (0.75 + Math.random() * 0.5) * 0.5,
          ph: Math.random() * Math.PI * 2,
        });
      }
    });

    let running = true;
    let t = 0;
    let last = { x: 0, y: 0 };

    const draw = () => {
      if (!running) return;
      t += 0.016;

      const nx = par.current.nx;
      const ny = par.current.ny;

      const needs =
        Math.abs(nx - last.x) > 0.001 ||
        Math.abs(ny - last.y) > 0.001 ||
        (Math.floor(t * 15) % 2 === 0);

      if (needs) {
        last = { x: nx, y: ny };
        ctx.clearRect(0, 0, vw, vh);
        stars.forEach(st => {
          const ox = nx * st.shift;
          const oy = ny * st.shift;
          const a = st.a * (0.85 + 0.15 * Math.sin(st.ph + t * st.tw));
          ctx.globalAlpha = a;
          ctx.fillStyle = "#fff";
          ctx.fillRect(st.x + ox, st.y + oy, st.s, st.s);
        });
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return () => { running = false; };
  }, [vw, vh]);

  return (
    <div
      ref={rootRef}
      className={`wg-root galaxy-appear ${appear ? "show" : ""}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,         // nav está por encima (10001)
        pointerEvents: "auto", // bloquea clics debajo
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
        "--tiltX": "0deg",
        "--tiltY": "0deg",
      }}
      aria-hidden="true"
    >
      {/* Estrellas fullscreen (canvas) */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* Escena centrada y responsiva */}
      <div
        className="wg-stage"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: S,
          height: S,
          transform: "translate(-50%, -50%)",
          perspective: "900px",
          perspectiveOrigin: "50% 40%",
          pointerEvents: "none",
        }}
      >
        <div
          className="wg-camera"
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: `rotateX(var(--tiltX)) rotateY(var(--tiltY))`,
            pointerEvents: "none",
            willChange: "transform",
          }}
        >
          <div
            className="wg-scene"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              pointerEvents: "none",
            }}
          >
            {/* Sol */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "min(72px, 8vw)",
                  height: "min(72px, 8vw)",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 35%, #fff 0%, #ffd2e0 40%, #ff5d8f 80%)",
                  color: "#fff",
                  fontWeight: 900,
                  textShadow: "0 2px 12px rgba(0,0,0,.3)",
                  boxShadow: "0 0 40px 12px rgba(255, 93, 143, .35)",
                  fontSize: "min(28px, 4.5vw)",
                }}
              >
                ❤
              </span>
            </div>

            {/* Anillos */}
            {rings.map((words, i) => {
              const cfg = ringConfigs[i];
              const D = S * cfg.r;
              const R = D / 2;
              const period = `${cfg.period}s`;

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: D,
                    height: D,
                    transform: `translate(-50%, -50%) translateZ(${cfg.z}px)`,
                    transformStyle: "preserve-3d",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="ring-spin"
                    style={{
                      position: "absolute",
                      inset: 0,
                      transformStyle: "preserve-3d",
                      "--tilt": `${cfg.tilt}deg`,
                      animation: `wgRingSpin ${period} linear infinite`,
                      willChange: "transform",
                    }}
                  >
                    {/* guía (orbita) */}
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: "1px dashed rgba(255,255,255,.32)",
                        pointerEvents: "none",
                      }}
                    />
                    {words.map((w, idx) => {
                      const n = Math.max(words.length, 1);
                      const start = (360 / n) * idx;
                      const dotSize = 10 + Math.round(6 * (i / rings.length));
                      return (
                        <div
                          key={idx}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%) rotate(${start}deg)`,
                            transformOrigin: "50% 50%",
                            "--start": `${start}deg`,   // pasamos el ángulo a CSS
                          }}
                        >
                          <div
                            style={{
                              transform: `translateY(${-R}px)`,
                              transformStyle: "preserve-3d",
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                width: dotSize,
                                height: dotSize,
                                borderRadius: 999,
                                background:
                                  "radial-gradient(circle at 35% 35%, #fff, #c8e1ff)",
                                boxShadow:
                                  "0 0 10px rgba(164,211,255,.5), 0 12px 20px rgba(0,0,0,.35)",
                              }}
                            />
                            <span
                              className="label-outer"
                              style={{
                                // contrarrotación sincronizada con el anillo (solo aquí)
                                animation: `wgCounterSpin ${period} linear infinite`,
                                transform: "rotateX(calc(-1 * var(--tilt)))", // anula tilt del anillo
                              }}
                            >
                              <span
                                className="label-face"
                                style={{
                                  color: "#fff",
                                  fontWeight: 800,
                                  textShadow:
                                    "0 1px 2px rgba(0,0,0,.35), 0 0 12px rgba(255,255,255,.18)",
                                  // endereza: cancela el ángulo de órbita + parallax
                                  transform:
                                    "rotateZ(calc(-1 * var(--start))) rotateY(calc(-1 * var(--tiltY))) rotateX(calc(-1 * var(--tiltX))) translateZ(0.5px)",
                                }}
                              >
                                {w}
                              </span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
