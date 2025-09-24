// src/components/sections/PhotoGallery.jsx
import { useRef, useState } from "react";
import { GALLERY_PHOTOS } from "../../constants";

export default function PhotoGallery() {
  const [idx, setIdx] = useState(0);
  const touch = useRef({ x: 0, y: 0 });

  const prev = () => setIdx((i) => (i - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length);
  const next = () => setIdx((i) => (i + 1) % GALLERY_PHOTOS.length);

  const onTouchStart = (e) => { touch.current.x = e.touches[0].clientX; touch.current.y = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
  };

  const current = GALLERY_PHOTOS[idx];

  return (
    <div className="gallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="gallery-frame">
        <img src={current.src} alt={current.caption} loading="lazy" />
      </div>
      <p style={{ textAlign: "center", marginTop: ".5rem", opacity: .9 }}>{current.caption}</p>
      <div className="gallery-controls">
        <button className="btn" onClick={prev}>&larr;</button>
        <span>{idx + 1}/{GALLERY_PHOTOS.length}</span>
        <button className="btn" onClick={next}>&rarr;</button>
      </div>
    </div>
  );
}
