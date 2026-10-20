
import { useState, useEffect, useRef } from "react";
import "../styles/chat.css";

function getStorageKey(data) {
  const character = (data.characterName || "Harmai")
    .trim()
    .toLowerCase();

  return `harmai_chat_${character}`;
}

function getInitialMessages(data) {
  return [
    {
      role: "character",
      text: `Hai, ${data.userName || "kamu"} ✨ Senang akhirnya kita bisa ngobrol. Kamu lagi apa hari ini?`,
    },
  ];
}

function loadMessages(key, data) {
  try {
    const saved = localStorage.getItem(key);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.every(
          (message) =>
            message &&
            ["user", "character"].includes(message.role) &&
            typeof message.text === "string"
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Gagal membaca riwayat chat:", error);
  }

  return getInitialMessages(data);
}

const menuItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "12px 10px",
  border: 0,
  borderRadius: 8,
  background: "transparent",
  color: "#282536",
  fontSize: 14,
  textAlign: "left",
  cursor: "pointer",
};

export default function Chat({
  data,
  onOpenMemory,
  onEditProfile,
  onOpenPersonalization,
}) {
  const storageKey = getStorageKey(data);

  const [messages, setMessages] = useState(() =>
    loadMessages(storageKey, data)
  );

  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (error) {
      console.error("Gagal menyimpan riwayat chat:", error);
    }
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  async function sendMessage(event) {
    event.preventDefault();

    const text = draft.trim();

    if (!text || isLoading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", text },
    ];

    setMessages(updatedMessages);
    setDraft("");
    setMenuOpen(false);
    setHeaderMenuOpen(false);
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages
        .slice(-10)
        .map((message) => ({
          role: message.role === "user" ? "user" : "assistant",
          content: message.text,
        }));

      const personalization = data.personalization || {};

      const memories =
        personalization.allowMemory === true &&
        Array.isArray(data.memories)
          ? data.memories
              .filter(
                (memory) =>
                  memory &&
                  typeof memory.content === "string" &&
                  memory.content.trim()
              )
              .slice(0, 20)
              .map((memory) => ({
                content: memory.content.slice(0, 500),
                category:
                  typeof memory.category === "string"
                    ? memory.category.slice(0, 50)
                    : "lainnya",
              }))
          : [];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            characterGender: data.characterGender || "",
            userName: data.userName || "",
            userGender: data.userGender || "",
          characterName: data.characterName || "Harmai",
          personality:
            data.personality ||
            data.characterPersonality ||
            "Ramah, hangat, santai, natural, dan suka menemani pengguna ngobrol.",
          messages: apiMessages,
          personalization,
          memories,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghubungi AI.");
      }

      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("AI belum memberikan jawaban.");
      }

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
          text: "Maaf ya, aku sedang kesulitan membalas pesanmu. Coba kirim pesan lagi, yuk.",
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

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="header-icon"
            onClick={() => setHeaderMenuOpen((open) => !open)}
            aria-label="Open settings menu"
            aria-expanded={headerMenuOpen}
            title="Pengaturan"
          >
            ⋯
          </button>

          {headerMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 220,
                background: "#fff",
                border: "1px solid #e8e6ef",
                borderRadius: 14,
                padding: 8,
                boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
                zIndex: 20,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  onEditProfile();
                }}
                style={menuItemStyle}
              >
                <span>👤</span>
                <span>Profil pengguna</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHeaderMenuOpen(false);
                  onOpenPersonalization();
                }}
                style={menuItemStyle}
              >
                <span>⚙️</span>
                <span>Personalization</span>
              </button>
            </div>
          )}
        </div>
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

        <div ref={messagesEndRef} />

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
              type="button"
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
