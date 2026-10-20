
import { useState } from "react";
import "../styles/chat.css";

export default function Chat({ data, onOpenMemory, onEditProfile }) {
  const [messages, setMessages] = useState([
    {
      role: "character",
      text: `Hai, ${data.userName || "kamu"} ✨ Senang akhirnya kita bisa ngobrol. Kamu lagi apa hari ini?`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();

    if (!text) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text },
    ]);
    setDraft("");
  }

  return (
    <main className="chat-page">
      <header className="chat-header">
        <div className="chat-character">
          <div className="character-avatar">
            {(data.characterName || "H").slice(0, 1).toUpperCase()}
          </div>
          <div className="character-details">
            <strong>{data.characterName || "Character"}</strong>
            <span><i /> Your character</span>
          </div>
        </div>

        <button
          className="header-icon"
          onClick={onEditProfile}
          aria-label="Edit profile"
          title="Edit profile"
        >
          ⋯
        </button>
      </header>

      <section className="chat-messages">
        <div className="chat-date">YOUR SPACE, YOUR STORY</div>

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-row ${message.role === "user" ? "user-row" : ""}`}
          >
            {message.role === "character" && (
              <div className="message-avatar">
                {(data.characterName || "H").slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className={`message-bubble ${message.role}`}>
              {message.text}
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="chat-hint">
            This is the beginning of something new.
          </div>
        )}
      </section>

      <footer className="chat-footer">
        {menuOpen && (
          <div className="plus-popover">
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenMemory();
              }}
            >
              <span>▤</span>
              <div>
                <strong>Buku Ingatan</strong>
                <small>Lihat ingatan character</small>
              </div>
              <span className="menu-arrow">→</span>
            </button>
          </div>
        )}

        <form className="chat-composer" onSubmit={sendMessage}>
          <button
            type="button"
            className={`plus-button ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "+"}
          </button>

          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Message ${data.characterName || "your character"}...`}
            aria-label="Type a message"
          />

          <button
            type="submit"
            className="send-button"
            disabled={!draft.trim()}
            aria-label="Send message"
          >
            ↑
          </button>
        </form>

        <p className="chat-disclaimer">
          Harmai preview · Conversations are simulated
        </p>
      </footer>
    </main>
  );
}
