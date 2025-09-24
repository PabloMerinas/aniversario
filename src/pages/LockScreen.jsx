import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_APP } from "../config/constants";

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

  const allAnswered = useMemo(
    () => QUESTIONS.every(q => values[q.id] && String(values[q.id]).trim() !== ""),
    [values]
  );

  const handleSuccess = () => {
    onUnlock();                            // ← actualiza estado en App
    navigate(ROUTE_APP, { replace: true }); // ← y ahora sí navega
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
        <h1 className="gradient-title">Feliz aniversario!</h1>
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
