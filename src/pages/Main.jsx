// src/pages/Main.jsx
import { useRef, useState, useEffect } from "react";
import LoveLetter from "../components/LoveLetter/LoveLetter";
import Page0 from "./Page0";
import { REQUIRE_UNLOCK_ALL } from "../config/constants";

const TOTAL_PAGES = 2;

export default function Main() {
  const [page, setPage] = useState(0);
  const [showLetter, setShowLetter] = useState(false);
  const [visited, setVisited] = useState({ letter: false, convo: false, highlights: false });
  const touch = useRef({ x: 0 });

  // Blackout
  const [showBlackout, setShowBlackout] = useState(false);
  const [blackoutOn, setBlackoutOn] = useState(false);
  const blackoutRef = useRef(null);

  // Mensaje sobre el blackout: 'hidden' | 'showing' | 'hiding'
  const [loveMsgPhase, setLoveMsgPhase] = useState("hidden");

  // Navegación diferida (a qué página vamos tras el fade)
  const [pendingNavTo, setPendingNavTo] = useState(null);
  const pendingNavRef = useRef(pendingNavTo);

  // Subir la barra inferior por encima del blackout tras el mensaje
  const [navOnTop, setNavOnTop] = useState(false);

  const allVisited = visited.letter && visited.convo && visited.highlights;
  const canAdvanceFromPage0 = REQUIRE_UNLOCK_ALL ? allVisited : true;

  // 0) Al montar el overlay, iniciar fade a negro en el siguiente frame
  useEffect(() => {
    if (!showBlackout) return;
    const id = requestAnimationFrame(() => {
      if (!blackoutRef.current) return;
      void blackoutRef.current.offsetWidth; // reflow
      setBlackoutOn(true);                  // -> opacity: 1 (2s)
    });
    return () => cancelAnimationFrame(id);
  }, [showBlackout]);

  // 1) Fin del fade a negro -> navegar (usando ref) y mostrar mensaje
  useEffect(() => {
    if (!showBlackout || !blackoutOn) return;
    const el = blackoutRef.current;
    if (!el) return;

    const onEnd = (e) => {
      if (e.propertyName !== "opacity") return;

      const target = pendingNavRef.current;  // 👈 leemos del ref
      if (target !== null) {
        setPage(target);
        setPendingNavTo(null);
      }

      setLoveMsgPhase("showing");
    };

    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [showBlackout, blackoutOn]); // 👈 sin pendingNavTo (no hay warning)

  // 2) Mensaje: 2s visible → .35s fade-out → subir nav encima del negro
  useEffect(() => {
    if (loveMsgPhase !== "showing") return;

    const t1 = setTimeout(() => {
      setLoveMsgPhase("hiding");
      const t2 = setTimeout(() => {
        setNavOnTop(true);
        setLoveMsgPhase("hidden");
      }, 350); // debe coincidir con el CSS
      return () => clearTimeout(t2);
    }, 2000);

    return () => clearTimeout(t1);
  }, [loveMsgPhase]);

  // 3) Si volvemos a la página 0: fade-out del negro (2s) y desmontar overlay
  useEffect(() => {
    if (page !== 0) return;

    setLoveMsgPhase("hidden");
    setNavOnTop(false);

    if (!showBlackout) return;
    if (blackoutOn) {
      setBlackoutOn(false);
      const t = setTimeout(() => setShowBlackout(false), 2000);
      return () => clearTimeout(t);
    } else {
      setShowBlackout(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Mantener ref sincronizado con el state
  useEffect(() => {
    pendingNavRef.current = pendingNavTo;
  }, [pendingNavTo]);

  const prev = () => setPage((p) => Math.max(0, p - 1));

  // Inicia blackout y navega cuando termina la animación
  const startBlackoutThenNavigate = (toPage) => {
    setNavOnTop(false);
    setLoveMsgPhase("hidden");

    // 👇 asegura que el listener lea el destino correcto desde ya
    pendingNavRef.current = toPage;
    setPendingNavTo(toPage);

    setShowBlackout(true); // monta overlay (opacity:0). El fade se lanza en [showBlackout].
  };

  const next = () => {
    if (page === 0) {
      if (!canAdvanceFromPage0) return;
      startBlackoutThenNavigate(1);
      return;
    }
    setPage((p) => Math.min(TOTAL_PAGES - 1, p + 1));
  };

  const onTouchStart = (e) => { touch.current.x = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
  };

  return (
    <div className="slides-root lock-bg">
      <div className="overlay" />
      <div className="slides-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {page === 0 ? (
          <Page0
            onOpenLetter={() => { setShowLetter(true); setVisited(v => ({ ...v, letter: true })); }}
            onOpenConversation={() => setVisited(v => ({ ...v, convo: true }))}
            onOpenHighlights={() => setVisited(v => ({ ...v, highlights: true }))}
          />
        ) : (
          <div style={{ color: "#fff" }}>Página 2 (vacía por ahora)</div>
        )}
      </div>

      <div className={`slides-nav ${navOnTop ? "nav-top" : ""}`} role="navigation" aria-label="Navegación de páginas">
        <div className="nav-row">
          {page !== 0 && (
            <button className="nav-btn" onClick={prev} aria-label="Página anterior">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div className="nav-heart" aria-hidden>❤</div>
          <button
            className="nav-btn"
            onClick={next}
            disabled={page === TOTAL_PAGES - 1 || (page === 0 && !canAdvanceFromPage0)}
            aria-label="Página siguiente"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {showLetter && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setShowLetter(false)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "min(92vw, 680px)", maxHeight: "80vh", overflow: "auto" }}>
            <h2 className="gradient-title" style={{ marginBottom: "1rem" }}>Para ti 💖</h2>
            <LoveLetter />
            <div style={{ textAlign: "right", marginTop: "1rem" }}>
              <button className="btn" onClick={() => setShowLetter(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de fade a negro */}
      {showBlackout && (
        <div
          ref={blackoutRef}
          className={`blackout ${blackoutOn ? "show" : ""}`}
          aria-hidden="true"
          style={{ transition: "opacity 2s ease" }}
        />
      )}

      {/* Mensaje sobre el negro */}
      {loveMsgPhase !== "hidden" && (
        <div className={`love-msg ${loveMsgPhase === "showing" ? "show" : "hide"}`} aria-hidden="true">
          <div className="love-msg-box">Y por que te quiero hasta el infinito...</div>
        </div>
      )}
    </div>
  );
}
