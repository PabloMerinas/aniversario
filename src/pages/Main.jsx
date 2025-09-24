import { useRef, useState } from "react";
import LoveLetter from "../components/LoveLetter/LoveLetter";
import Page0 from "./Page0"; // 👈 sin llaves y con P mayúscula

const TOTAL_PAGES = 2;

export default function Main() {
    const [page, setPage] = useState(0);
    const [showLetter, setShowLetter] = useState(false);
    const touch = useRef({ x: 0 });

    const prev = () => setPage((p) => Math.max(0, p - 1));
    const next = () => setPage((p) => Math.min(TOTAL_PAGES - 1, p + 1));

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
                    <Page0 onOpenLetter={() => setShowLetter(true)} />
                ) : (
                    <div style={{ color: "#fff" }}>Página 2 (vacía por ahora)</div>
                )}
            </div>

            <div className="slides-nav" role="navigation" aria-label="Navegación de páginas">
                <div className="nav-row">
                    {page !== 0 && (
                        <button className="nav-btn" onClick={prev} aria-label="Página anterior">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                    <div className="nav-heart" aria-hidden>❤</div>
                    <button className="nav-btn" onClick={next} disabled={page === TOTAL_PAGES - 1} aria-label="Página siguiente">
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
        </div>
    );
}
