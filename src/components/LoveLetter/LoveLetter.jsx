// src/components/sections/LoveLetter.jsx
import { useEffect, useRef, useState } from "react";
import { LETTER_TEXT } from "../../config/constants";

export default function LoveLetter() {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const iRef = useRef(0);

  useEffect(() => {
    const speed = 25; // ms por carácter
    const t = setInterval(() => {
      setText((prev) => {
        const next = LETTER_TEXT.slice(0, iRef.current + 1);
        iRef.current++;
        if (iRef.current >= LETTER_TEXT.length) {
          clearInterval(t);
          setDone(true);
        }
        return next;
      });
    }, speed);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{text}</p>
      {!done && (
        <div style={{ marginTop: "0.75rem" }}>
          <button className="btn" onClick={() => { setText(LETTER_TEXT); setDone(true); }}>
            Mostrar todo
          </button>
        </div>
      )}
    </div>
  );
}
