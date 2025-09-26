import { useEffect, useMemo, useState } from "react";
import { FLOWER_CONFIG as CFG } from "../../config/constants";
import principal from "../../assets/images/principal.png";

// 16 PNGs
import rose1 from "../../assets/images/roses1.png";
import rose2 from "../../assets/images/roses2.png";
import rose3 from "../../assets/images/roses3.png";
import rose4 from "../../assets/images/roses4.png";
import rose5 from "../../assets/images/roses5.png";
import rose6 from "../../assets/images/roses6.png";
import rose7 from "../../assets/images/roses7.png";
import rose8 from "../../assets/images/roses8.png";
import rose9 from "../../assets/images/roses9.png";
import rose10 from "../../assets/images/roses10.png";
import rose11 from "../../assets/images/roses11.png";
import rose12 from "../../assets/images/roses12.png";
import rose13 from "../../assets/images/roses13.png";
import rose14 from "../../assets/images/roses14.png";
import rose15 from "../../assets/images/roses15.png";
import rose16 from "../../assets/images/roses16.png";

const ROSES = [
  rose1, rose2, rose3, rose4,
  rose5, rose6, rose7, rose8,
  rose9, rose10, rose11, rose12,
  rose13, rose14, rose15, rose16,
];

function rand(a, b) { return a + Math.random() * (b - a); }
function shuffle(a){ for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
const pick = (arr,i)=>arr[i % arr.length];

const CAPTION = "Por que de todas nuestras flores, tu eres la mas bonita <3";

export default function FlowerField() {
  const [appear, setAppear] = useState(false);

  // mostrar el campo (fade-in del contenedor)
  useEffect(() => {
    const id = requestAnimationFrame(() => setAppear(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // ====== FLORES ======
  const flowers = useMemo(() => {
    const rows = CFG.GRID_ROWS;
    const cols = CFG.GRID_COLS;

    // celdas + shuffle para repartir mejor
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) cells.push({ r, c });
    }
    shuffle(cells);

    const arr = [];
    for (let i = 0; i < CFG.COUNT; i++) {
      const cell = cells[i % cells.length];
      const cx = CFG.X_MIN + (cell.c + 0.5) * ((CFG.X_MAX - CFG.X_MIN) / cols);
      const cy = CFG.Y_MIN + (cell.r + 0.5) * ((CFG.Y_MAX - CFG.Y_MIN) / rows);

      const x = cx + rand(-CFG.JITTER_X, CFG.JITTER_X);
      const y = cy + rand(-CFG.JITTER_Y, CFG.JITTER_Y);

      // tamaño relativo a la altura (vh) → en px
      const vh = typeof window !== "undefined" ? window.innerHeight : 720;
      const sizePx = Math.round((rand(CFG.SIZE_VH_MIN, CFG.SIZE_VH_MAX) / 100) * vh);

      const scale = rand(CFG.SCALE_MIN, CFG.SCALE_MAX);
      const rot = rand(CFG.ROT_MIN, CFG.ROT_MAX);
      const delay = CFG.BASE_DELAY + i * CFG.STAGGER_MS + Math.random() * CFG.RAND_DELAY;
      const float = Math.random() < CFG.FLOAT_RATIO;

      arr.push({
        id: i,
        img: pick(ROSES, i),
        x, y,
        size: sizePx,
        scale,
        rot,
        delay,
        float,
        z: 1000 + i, // 👈 cada flor que entra después queda por delante
      });
    }
    return arr;
  }, []);

  // ====== FRASE (typing) + IMAGEN CENTRAL ======
  const [typingStart, setTypingStart] = useState(false);
  const [typed, setTyped] = useState("");
  const [doneTyping, setDoneTyping] = useState(false);
  const [showCenter, setShowCenter] = useState(false);

  // arranca el typing 2s después de montar
  useEffect(() => {
    const t = setTimeout(() => setTypingStart(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // typing de la frase
  useEffect(() => {
    if (!typingStart) return;
    let i = 0;
    const speed = CFG.TYPE_SPEED_MS ?? 45; // puedes ponerlo en constants
    const timer = setInterval(() => {
      i++;
      setTyped(CAPTION.slice(0, i));
      if (i >= CAPTION.length) {
        clearInterval(timer);
        setDoneTyping(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [typingStart]);

  // cuando termina de escribirse la frase → aparece la imagen central
  useEffect(() => {
    if (!doneTyping) return;
    const t = setTimeout(() => setShowCenter(true), 300);
    return () => clearTimeout(t);
  }, [doneTyping]);

  return (
    <div className={`flower-root ${appear ? "show" : ""}`} aria-hidden="true">
      <div className="flower-vignette" />

      {/* Frase arriba con typing */}
      <div className={`flower-caption ${typingStart ? "show" : ""}`} aria-live="polite">
        {typed}
        {!doneTyping && <span className="caret" aria-hidden="true">|</span>}
      </div>

      {/* Imagen central cuadrada y responsive */}
      <div className={`center-wrap ${showCenter ? "show" : ""}`}>
        <img className="center-img" src={principal} alt="" draggable={false} />
      </div>

      {/* Flores */}
      {flowers.map(f => (
        <img
          key={f.id}
          className={`flower ${f.float ? "float" : ""}`}
          src={f.img}
          alt=""
          decoding="async"
          draggable={false}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            "--size": `${f.size}px`,
            "--scale": f.scale,
            "--rot": `${f.rot}deg`,
            "--delay": `${Math.round(f.delay)}ms`,
            "--growMs": `${CFG.GROW_MS}ms`,
            "--floatMs": `${CFG.FLOAT_MS}ms`,
          }}
        />
      ))}
    </div>
  );
}
