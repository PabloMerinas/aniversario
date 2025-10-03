import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_APP, ANIVERSARIO_DATE, ANIVERSARIO_TEXTO } from "../config/constants";

const QUESTIONS = [
  {
    id: "q1",
    type: "choice",
    question: "¿Como se llama huevito?",
    options: ["Santiago Abascal", "Huevazo", "EggMon", "Hermoso"],
    answer: "EggMon",
  },
  {
    id: "q2",
    type: "text",
    question: "¿Como se llamaría nuestro hijo? (Sin mayúsculas)",
    answer: "alejandro",
  },
  {
    id: "q3",
    type: "choice",
    question: "¿Que es lo que mas hemos comido en estos 2 años?",
    options: ["Pizza", "Vicio", "Sushi", "Tekila"],
    answer: "Sushi",
  },
];

export default function LockScreen({ onUnlock }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  // Cálculo dinámico del título (se recomputa en cada render)
  const now = new Date();
  const diffMs = ANIVERSARIO_DATE - now;
  const daysLeft = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
  const title =
    daysLeft > 0
      ? `Feliz ${"casi ".repeat(daysLeft)}aniversario!`
      : "Feliz aniversario!";

  const allAnswered = useMemo(
    () => QUESTIONS.every(q => values[q.id] && String(values[q.id]).trim() !== ""),
    [values]
  );

  const handleSuccess = () => {
    const now = new Date();
    if (now < ANIVERSARIO_DATE) {
      setOk(false);
      const ms = ANIVERSARIO_DATE - now;
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      const plural = days === 1 ? "" : "s";
      setError(`Aún no es el momento… Vuelve el ${ANIVERSARIO_TEXTO} (faltan ${days} día${plural}).`);
      return;
    }
    onUnlock();
    navigate(ROUTE_APP, { replace: true });
  };

  const checkAnswers = () => {
    const wrong = QUESTIONS.find(q => {
      const v = String(values[q.id] ?? "").trim();
      return q.type === "text" ? v.toLowerCase() !== q.answer.toLowerCase() : v !== q.answer;
    });
    if (wrong) {
      setOk(false);
      setError("¡Uy! Que poquita memoria! :( Inténtalo de nuevo");
    } else {
      setError("");
      setOk(true);
      handleSuccess(); // sin setTimeout para evitar carreras raras
    }
  };

  return (
    <div className="lock-bg">
      <div className="overlay" />

      <div className="card">
        <h1 className="gradient-title">{title}</h1>
        <p className="subtitle" style={{ textAlign: "center" }}>
          PRIMERO! Hay que comprobar que seas tu! Tendras que superar este TEST SUPERAVANZADO
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkAnswers();
          }}
          className="quiz"
        >
          {QUESTIONS.map((q) => (
            <div key={q.id} className="field">
              <label>{q.question}</label>

              {q.type === "choice" && (
                <select
                  value={values[q.id] || ""}
                  onChange={(e) => setValues(v => ({ ...v, [q.id]: e.target.value }))}
                >
                  <option value="">— Elige —</option>
                  {q.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {q.type === "text" && (
                <input
                  type="text"
                  placeholder="Escribe aquí…"
                  value={values[q.id] || ""}
                  onChange={(e) => setValues(v => ({ ...v, [q.id]: e.target.value }))}
                  autoCapitalize="none"
                  autoComplete="off"
                  enterKeyHint="done"
                />
              )}
            </div>
          ))}

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn" disabled={!allAnswered}>
            {ok ? "¡Correcto! ✨" : "Entrar"}
          </button>
        </form>
      </div>

      {/* corazones flotando */}
      <div className="hearts" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => <span key={i}>❤</span>)}
      </div>
    </div>
  );
}
