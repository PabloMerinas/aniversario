// src/pages/Final.jsx
import Fireworks from "./Fireworks";
import { FINALLY_TEXT } from "../../config/constants";

export default function Final() {
  return (
    <div
      className="final-wrap"
      role="region"
      aria-label="Mensaje final de aniversario"
      style={{ position: "relative", zIndex: 1 }}
    >
      <Fireworks />
      <h2 className="final-title">Gracias por estos dos años</h2>
      <p className="final-sub">{FINALLY_TEXT}</p>
    </div>
  );
}
