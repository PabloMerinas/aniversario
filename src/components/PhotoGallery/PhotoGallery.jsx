// src/components/PhotoGallery/PhotoGallery.jsx
import { useEffect, useRef, useState } from "react";
import { GALLERY_IMAGES, GALLERY_CAPTION } from "../../config/constants";

export default function PhotoGallery({
  speed = 70,
  autoplay = true,
  peek = true,
  caption = GALLERY_CAPTION,
}) {
  const total = Array.isArray(GALLERY_IMAGES) ? GALLERY_IMAGES.length : 0;
  const slides = [...GALLERY_IMAGES, ...GALLERY_IMAGES];
  const [visible, setVisible] = useState(false);

  const frameRef = useRef(null);
  const trackRef = useRef(null);

  const [loopWidth, setLoopWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const lastT = useRef(null);
  const rafRef = useRef(null);

  const captionText =
    typeof caption === "string" && caption.trim() ? caption : (GALLERY_CAPTION || "");

  const measure = () => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    setLoopWidth(half);
  };

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [total]);

  useEffect(() => {
    if (!autoplay) return;
    const tick = (t) => {
      if (lastT.current == null) lastT.current = t;
      const dt = (t - lastT.current) / 1000;
      lastT.current = t;
      if (!pausedRef.current && loopWidth > 0) {
        offsetRef.current += speed * dt;
        if (offsetRef.current >= loopWidth) offsetRef.current -= loopWidth;
        if (offsetRef.current < 0) offsetRef.current += loopWidth;
        setOffset(offsetRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); lastT.current = null; };
  }, [autoplay, speed, loopWidth]);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);
  const startX = useRef(0);
  const onDown = (x) => { pausedRef.current = true; setDragging(true); startX.current = x; };
  const onMove = (x) => {
    if (!dragging) return;
    const dx = x - startX.current;
    startX.current = x;
    offsetRef.current -= dx;
    if (loopWidth > 0) {
      while (offsetRef.current >= loopWidth) offsetRef.current -= loopWidth;
      while (offsetRef.current < 0) offsetRef.current += loopWidth;
    }
    setOffset(offsetRef.current);
  };
  const onUp = () => { if (!dragging) return; setDragging(false); setTimeout(() => (pausedRef.current = false), 120); };

  const onPointerDown = (e) => { e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); onDown(e.clientX); };
  const onPointerMove = (e) => onMove(e.clientX);
  const onPointerUp = () => onUp();

  const onTouchStart = (e) => onDown(e.touches[0].clientX);
  const onTouchMove = (e) => onMove(e.touches[0].clientX);
  const onTouchEnd = () => onUp();

  if (total === 0) return <div style={{ color: "#fff" }}>No hay imágenes para mostrar.</div>;

  const frameStyle = { "--peek-offset": peek ? "28px" : "0px" };

  return (
    <>
      {/* Texto simple, fuera del carrusel */}
      <div className={`gallery-caption ${visible ? "show" : ""}`}>
        {captionText}
      </div>      <div>
        <div className={`gallery-root-mini ${peek ? "peek" : ""}`}>
          <div
            ref={frameRef}
            className={`gallery-frame ${dragging ? "dragging" : ""}`}
            style={frameStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            role="region"
            aria-label="Carrusel de fotos"
          >
            <div
              ref={trackRef}
              className="gallery-track"
              style={{ transform: `translate3d(${-offset}px,0,0)` }}
            >
              {slides.map((src, i) => (
                <div className="gallery-slide" key={i}>
                  <img className="gallery-img" src={src} alt={`gallery ${i % total + 1}`} draggable={false} onLoad={measure} />
                </div>
              ))}
            </div>
          </div></div>
      </div>
    </>
  );
}
