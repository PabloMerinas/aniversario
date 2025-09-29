// src/pages/Main.jsx
import { useRef, useState, useEffect } from "react";
import LoveLetter from "../components/LoveLetter/LoveLetter";
import Page0 from "./Page0";
import { REQUIRE_UNLOCK_ALL, START_PAGE, TOTAL_PAGES } from "../config/constants";
import WordGalaxy from "../components/GalaxyWords/WordGalaxy";
import FlowerField from "../components/FlowerField/FlowerField";
import PhotoGallery from "../components/PhotoGallery/PhotoGallery";
import Final from "../components/Final/Final";

export default function Main() {
  // Estado para forzar el reinicio de las flores
  const [flowerReset, setFlowerReset] = useState(0);
  const safeStart = Number.isInteger(START_PAGE)
    ? Math.max(0, Math.min(TOTAL_PAGES - 1, START_PAGE))
    : 0;
  const [page, setPage] = useState(safeStart); const [showLetter, setShowLetter] = useState(false);
  const [visited, setVisited] = useState({ letter: false, convo: false, highlights: false });

  // Galaxy
  const [showGalaxy, setShowGalaxy] = useState(false);
  const [galaxyLeaving, setGalaxyLeaving] = useState(false);

  // Blackout
  const [showBlackout, setShowBlackout] = useState(false);
  const [blackoutOn, setBlackoutOn] = useState(false);
  const blackoutRef = useRef(null);

  // Mensaje sobre el blackout: 'hidden' | 'showing' | 'hiding'
  const [loveMsgPhase, setLoveMsgPhase] = useState("hidden");

  // Navegación diferida (a qué página iremos tras el fade a negro)
  const [pendingNavTo, setPendingNavTo] = useState(null);
  const pendingNavRef = useRef(pendingNavTo);

  // Barra inferior por encima del blackout después del mensaje
  const [navOnTop, setNavOnTop] = useState(false);

  // Fondo más oscuro en páginas 1 y 2 (solo clase para estilos si la usas)
  const [darkBg, setDarkBg] = useState(false);
  useEffect(() => { setDarkBg(page === 1 || page === 2); }, [page]);

  // Cuando entras en la página de flores, fuerza el reset
  useEffect(() => {
    if (page === 2) {
      setFlowerReset(r => r + 1);
    }
  }, [page]);

  const allVisited = visited.letter && visited.convo && visited.highlights;
  const canAdvanceFromPage0 = REQUIRE_UNLOCK_ALL ? allVisited : true;

  // Lanzar el fade IN del blackout tras montarlo
  useEffect(() => {
    if (!showBlackout) return;
    const id = requestAnimationFrame(() => {
      if (!blackoutRef.current) return;
      void blackoutRef.current.offsetWidth; // reflow
      setBlackoutOn(true);                  // -> opacity: 1 (2s)
    });
    return () => cancelAnimationFrame(id);
  }, [showBlackout]);

  // Al terminar el fade IN del blackout: navegar y mostrar mensaje
  useEffect(() => {
    if (!showBlackout || !blackoutOn) return;
    const el = blackoutRef.current;
    if (!el) return;

    const onEnd = (e) => {
      if (e.propertyName !== "opacity") return;

      const target = pendingNavRef.current;
      if (target !== null) {
        setPage(target);
        setPendingNavTo(null);
      }

      setLoveMsgPhase("showing");
    };

    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [showBlackout, blackoutOn]);

  // Mensaje 2s → fade OUT del blackout (2s) → desmontar blackout
  useEffect(() => {
    if (loveMsgPhase !== "showing") return;

    const t1 = setTimeout(() => {
      setLoveMsgPhase("hiding");
      setBlackoutOn(false); // opacity: 0 (2s)

      const t2 = setTimeout(() => {
        setNavOnTop(true);
        setLoveMsgPhase("hidden");

        // desmonta el blackout cuando termine su transición (~2s)
        const t3 = setTimeout(() => setShowBlackout(false), 2000);

        // si hemos navegado a la página 1, mostramos la galaxia
        setShowGalaxy(prev => (page === 1 ? true : prev));

        return () => clearTimeout(t3);
      }, 350); // coincide con CSS del mensaje

      return () => clearTimeout(t2);
    }, 2000);

    return () => clearTimeout(t1);
  }, [loveMsgPhase, page]);

  // Si volvemos a la página 0: fade-out del negro (2s) y desmontaje
  useEffect(() => {
    if (page !== 0) return;

    setShowGalaxy(false);
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

  // Mantener la ref de navegación diferida sincronizada
  useEffect(() => {
    pendingNavRef.current = pendingNavTo;
  }, [pendingNavTo]);



  // Navegación
  const prev = () => {
    setPage((p) => {
      const newP = Math.max(0, p - 1);
      // Si volvemos de flores (2) a galaxia (1), volvemos a mostrar galaxia
      if (p === 2 && newP === 1) {
        setShowGalaxy(true);
        setGalaxyLeaving(false);
      }
      return newP;
    });
  };

  const startBlackoutThenNavigate = (toPage) => {
    setNavOnTop(false);
    setLoveMsgPhase("hidden");

    pendingNavRef.current = toPage;
    setPendingNavTo(toPage);

    setShowBlackout(true); // monta overlay (opacity:0). El IN se lanza en el efecto.
  };

  const next = () => {
    if (page === 0) {
      if (!canAdvanceFromPage0) return;
      startBlackoutThenNavigate(1);
      return;
    }

    if (page === 1) {
      // desvanecer galaxia antes de pasar a flores
      setGalaxyLeaving(true);
      setTimeout(() => {
        setGalaxyLeaving(false);
        setShowGalaxy(false);
        setPage(2);
      }, 900); // coincide con .galaxy-appear.leaving
      return;
    }

    setPage((p) => Math.min(TOTAL_PAGES - 1, p + 1));
  };

  useEffect(() => {
    document.body.classList.toggle('page-2', page === 2);
  }, [page]);

  return (
    <div className={`slides-root lock-bg ${darkBg ? "dark" : ""}`}>
      <div className="overlay" />

      {/* CONTENIDO CENTRADO EN CADA PÁGINA */}
  <div className="slides-viewport">
        {page === 0 ? (
          <Page0
            onOpenLetter={() => { setShowLetter(true); setVisited(v => ({ ...v, letter: true })); }}
            onOpenConversation={() => setVisited(v => ({ ...v, convo: true }))}
            onOpenHighlights={() => setVisited(v => ({ ...v, highlights: true }))}
          />
        ) : page === 1 ? (
          <div style={{ color: "#fff" }}></div>
        ) : page === 2 ? (
          <div style={{ color: "#fff" }}></div>
        ) : page === 3 ? (
          <PhotoGallery
            caption="Porque de todas las personas, es contigo con quien quiero estar 💖"
            autoplay={true}
            speed={80}
            peek={true}
          />
        ) : (
          <Final />
        )}
      </div>

      {/* NAV INFERIOR: oculto en la última página */}
      {page !== TOTAL_PAGES - 1 && (
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
      )}

      {/* MODAL CARTA */}
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

      {/* OVERLAY BLACKOUT (con fade in/out) */}
      {showBlackout && (
        <div
          ref={blackoutRef}
          className={`blackout ${blackoutOn ? "show" : ""}`}
          aria-hidden="true"
          style={{ transition: "opacity 2s ease" }}
        />
      )}

      {/* MENSAJE SOBRE BLACKOUT */}
      {loveMsgPhase !== "hidden" && (
        <div className={`love-msg ${loveMsgPhase === "showing" ? "show" : "hide"}`} aria-hidden="true">
          <div className="love-msg-box">Porque te quiero hasta el infinito...</div>
        </div>
      )}

      {/* OVERLAYS */}
  {page === 1 && showGalaxy && <WordGalaxy leaving={galaxyLeaving} />}
  {page === 2 && <FlowerField key={flowerReset} />}
    </div>
  );
}
