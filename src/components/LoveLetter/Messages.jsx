import { FIRST_CONVERSATION } from "../../config/constants";

export default function Messages({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="messages-card" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>💬 Nuestra primera conversación</h2>
        <div className="messages-list">
          {FIRST_CONVERSATION.map((msg, idx) => (
            <div
              key={idx}
              className={`msg-bubble ${msg.author === "Pablo" ? "right" : "left"}`}
            >
              {msg.date && (
                <div className="msg-meta">{msg.date}</div>
              )}
            <div>{msg.text}</div>

            </div>
          ))}
        </div>
        <button className="btn" style={{ marginTop: "1rem" }} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
