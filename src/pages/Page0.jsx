// src/pages/Page0.jsx
import { useState } from "react";
import Messages from "../components/LoveLetter/Messages";
import MessagesHighlights from "../components/LoveLetter/MessagesHighlights"; // ⬅ nuevo import

export default function Page0({ onOpenLetter, onOpenConversation, onOpenHighlights }) {
  const [showMessages, setShowMessages] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  return (
    <div className="scene">
      <div className="card-stack">
        {/* Carta */}
        <div
          className="letter-card"
          role="button"
          tabIndex={0}
          aria-label="Abrir carta"
          onClick={onOpenLetter}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && onOpenLetter?.()
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="5" width="18" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            <div>
              <div style={{ fontWeight: 800 }}>Carta para ti</div>
              <div style={{ opacity: 0.9 }}>Toca para abrir 💌</div>
            </div>
          </div>
        </div>

        {/* Primera conversación */}
        <div
          className="letter-card"
          role="button"
          tabIndex={0}
          aria-label="Abrir conversación"
          onClick={() => { setShowMessages(true); onOpenConversation?.(); }}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setShowMessages(true), onOpenConversation?.())}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H9l-4 3 1.2-3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"
                stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <div>
              <div style={{ fontWeight: 800 }}>Nuestra primera conversación</div>
              <div style={{ opacity: 0.9 }}>Toca para ver 💬</div>
            </div>
          </div>
        </div>

        {/* Mensajes destacados */}
        <div
          className="letter-card"
          role="button"
          tabIndex={0}
          aria-label="Abrir destacados"
          onClick={() => { setShowHighlights(true); onOpenHighlights?.(); }}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (setShowHighlights(true), onOpenHighlights?.())}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.402 8.171L12 18.897l-7.336 3.866 1.402-8.171L.132 9.21l8.2-1.192L12 .587z"
                stroke="currentColor" strokeWidth="2" fill="none"
              />
            </svg>
            <div>
              <div style={{ fontWeight: 800 }}>Mensajes destacados</div>
              <div style={{ opacity: 0.9 }}>Toca para ver ⭐</div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="gradient-title">
        Feliz aniversario
        <div
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            opacity: 0.95,
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,.25)",
          }}
        >
          Desliza para cambiar de página
        </div>
      </h1>

      {showMessages && <Messages onClose={() => setShowMessages(false)} />}
      {showHighlights && (
        <MessagesHighlights onClose={() => setShowHighlights(false)} />
      )}
    </div>
  );
}
