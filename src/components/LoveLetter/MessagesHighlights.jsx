import { useEffect, useRef, useState } from "react";
import { MESSAGES_TEXT, AUDIO_HIGHLIGHT } from "../../config/constants";

function parseLine(line) {
  // "10/12/23 07:17 - Pablo: Texto…"
  const m = line.match(/^(.+?)\s-\s([^:]+):\s([\s\S]*)$/);
  if (!m) return { date: "", author: "Rocio", text: line };
  const [, date, author, text] = m;
  return { date: date.trim(), author: author.trim(), text: text.trim() };
}

export default function MessagesHighlights({ onClose }) {
  // ---- estado/refs para el audio ----
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime || 0);
    const onLoaded = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
  };

  const side = (AUDIO_HIGHLIGHT.author || "").toLowerCase().startsWith("pablo")
    ? "right" : "left";
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="messages-card" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>⭐ Mensajes destacados</h2>

        <div className="messages-list">
          {/* destacados de texto */}
          {MESSAGES_TEXT.map((line, idx) => {
            const { date, author, text } = parseLine(line);
            const s = author.toLowerCase().startsWith("pablo") ? "right" : "left";
            return (
              <div key={idx} className={`msg-bubble ${s}`}>
                <div>{text}</div>
                {date && <div className="msg-meta">{date}</div>}
              </div>
            );
          })}

          {/* --- último: audio-mensaje --- */}
          <div
            className={`msg-bubble ${side}`}
            role="button"
            tabIndex={0}
            onClick={togglePlay}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && togglePlay()}
            aria-label="Reproducir audio"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Botón redondo Play/Pause */}
              <div
                style={{
                  width: 36, height: 36, borderRadius: "999px",
                  display: "grid", placeItems: "center",
                  border: "1px solid rgba(0,0,0,.2)",
                  background: "rgba(255,255,255,.75)"
                }}
              >
                {playing ? (
                  // pausa
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                  </svg>
                ) : (
                  // play
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                )}
              </div>

              <div>
                <div>{AUDIO_HIGHLIGHT.label || "Mensaje de voz"}</div>
                {AUDIO_HIGHLIGHT.date && (
                  <div className="msg-meta">{AUDIO_HIGHLIGHT.date}</div>
                )}
                {/* barra de progreso */}
                <div
                  aria-hidden
                  style={{
                    marginTop: 6, height: 4, width: 200,
                    background: "rgba(0,0,0,.15)", borderRadius: 999
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: "rgba(0,0,0,.35)",
                      borderRadius: 999
                    }}
                  />
                </div>
              </div>
            </div>

            <audio ref={audioRef} src={AUDIO_HIGHLIGHT.src} preload="metadata" />
          </div>
        </div>

        <button className="btn" style={{ marginTop: "1rem" }} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
