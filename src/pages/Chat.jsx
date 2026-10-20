
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
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();

    const text = draft.trim();

    if (!text || isLoading) return;

    const userMessage = {
      role: "user",
      text,
    };

    // Tampilkan pesan pengguna langsung di chat.
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setDraft("");
    setMenuOpen(false);
    setIsLoading(true);

    try {
      // Ubah format pesan untuk API AI.
      const apiMessages = updatedMessages
        .filter(
          (message) =>
            ["user", "character"].includes(message.role) &&
            typeof message.text === "string"
        )
        .slice(-10)
        .map((message) => ({
          role: message.role === "user" ? "user" : "assistant",
          content: message.text,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characterName: data.characterName || "Harmai",
          personality:
            data.personality ||
            data.characterPersonality ||
            "Ramah, hangat, santai, natural, dan suka menemani pengguna ngobrol.",
          messages: apiMessages,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghubungi AI.");
      }

      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("AI belum memberikan jawaban.");
      }

      // Tampilkan balasan AI.
      setMessages((previous) => [
        ...previous,
        {
          role: "character",
          text: result.reply.trim(),
        },
      ]);
    } catch (error) {
      console.error("Harmai chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "character",
          text: "Maaf ya, aku lagi kesulitan membalas pesanmu. 🥹 Coba kirim pesan lagi, yuk.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
            <span>
              <i />
              {isLoading ? "Thinking..." : "Your character"}
            </span>
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
            className={`message-row ${
              message.role === "user" ? "user-row" : ""
            }`}
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

        {isLoading && (
          <div className="message-row">
            <div className="message-avatar">
              {(data.characterName || "H").slice(0, 1).toUpperCase()}
            </div>

            <div className="message-bubble character">
              Sedang mengetik...
            </div>
          </div>
        )}

        {messages.length === 1 && !isLoading && (
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
            disabled={isLoading}
          />

          <button
            type="submit"
            className="send-button"
            disabled={!draft.trim() || isLoading}
            aria-label="Send message"
          >
            ↑
          </button>
        </form>

        <p className="chat-disclaimer">
          Harmai preview · AI-powered conversations
        </p>
      </footer>
    </main>
  );
}
