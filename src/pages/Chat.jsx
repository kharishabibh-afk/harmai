
import { useState, useEffect, useRef } from "react";
import "../styles/chat.css";

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `memory-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function getStorageKey(data) {
  return `harmai_chat_${(data.characterName || "Harmai")
    .trim()
    .toLowerCase()}`;
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

async function readResponse(response) {
  const text = await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(
      response.status === 502
        ? "Server AI mengembalikan 502. Coba lagi nanti."
        : `Respons server tidak valid (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      result.error || `Permintaan gagal (HTTP ${response.status}).`
    );
  }

  return result;
}


export default function Chat({
  data,
  setData,
  onOpenMemory,
  onGoHome,
  onEditProfile,
  onEditCharacter,
  onOpenPersonalization,
}) {
  const storageKey = getStorageKey(data);

  const [messages, setMessages] = useState(() =>
    loadMessages(storageKey, data)
  );
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const [aiPanelIndex, setAiPanelIndex] = useState(null);
  const [aiDraft, setAiDraft] = useState("");
  const [aiReason, setAiReason] = useState("");
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiNotice, setAiNotice] = useState("");

  const [replyTo, setReplyTo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  function getPersonalizationPayload() {
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

    return { personalization, memories };
  }

  function toApiMessages(history) {
    return history.slice(-10).map((message) => {
      let content = message.text;

      if (message.role === "user" && message.replyToText) {
        content =
          `Konteks pesan karakter yang sedang dibalas:\n` +
          `"${message.replyToText}"\n\n` +
          `Pesan pengguna:\n${message.text}`;
      }

      return {
        role: message.role === "user" ? "user" : "assistant",
        content,
      };
    });
  }

  async function requestCharacterReply(history) {
    const { personalization, memories } =
      getPersonalizationPayload();

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterGender: data.characterGender || "",
        userName: data.userName || "",
        userGender: data.userGender || "",
        characterName: data.characterName || "Harmai",
        personality:
          data.personality ||
          data.characterPersonality ||
          "Ramah, hangat, santai, natural, dan suka menemani pengguna ngobrol.",
        messages: toApiMessages(history),
        personalization,
        memories,
      }),
    });

    const result = await readResponse(response);

    if (typeof result.reply !== "string" || !result.reply.trim()) {
      throw new Error("AI belum memberikan jawaban.");
    }

    return result.reply.trim();
  }

  async function sendMessage(event) {
    event.preventDefault();

    const text = draft.trim();
    if (!text || isLoading) return;

    const userMessage = {
      role: "user",
      text,
      ...(replyTo
        ? {
            replyToText: replyTo.text,
            replyToRole: replyTo.role,
          }
        : {}),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setDraft("");
    setReplyTo(null);
    setMenuOpen(false);
    setHeaderMenuOpen(false);
    closeAiPanel();
    setIsLoading(true);
    setLoadingAction("send");

    try {
      const reply = await requestCharacterReply(updatedMessages);

      setMessages((previous) => [
        ...previous,
        { role: "character", text: reply },
      ]);
    } catch (error) {
      console.error("Harmai chat error:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "character",
          text: "Maaf ya, aku sedang kesulitan membalas pesanmu. Coba kirim pesan lagi, yuk.",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  }

  async function reloadReply(index) {
    if (isLoading) return;

    const target = messages[index];
    if (!target || target.role !== "character") return;

    const history = messages.slice(0, index);

    if (!history.some((message) => message.role === "user")) {
      window.alert("Belum ada pesan pengguna yang bisa dijawab ulang.");
      return;
    }

    setIsLoading(true);
    setLoadingAction(`reload-${index}`);
    closeAiPanel();

    try {
      const reply = await requestCharacterReply(history);

      setMessages((previous) =>
        previous.map((message, messageIndex) =>
          messageIndex === index
            ? { ...message, text: reply, isError: false }
            : message
        )
      );
    } catch (error) {
      console.error("Gagal membuat ulang balasan:", error);
      window.alert(error.message || "Gagal membuat jawaban alternatif.");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  }

  function startReply(message) {
    setReplyTo({ role: message.role, text: message.text });
    closeAiPanel();
    setMenuOpen(false);

    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeAiPanel() {
    setAiPanelIndex(null);
    setAiDraft("");
    setAiReason("");
    setAiStatus("idle");
    setAiNotice("");
  }

  function toggleAiPanel(index) {
    if (aiPanelIndex === index) {
      closeAiPanel();
      return;
    }

    setAiPanelIndex(index);
    setAiDraft("");
    setAiReason("");
    setAiStatus("idle");
    setAiNotice("");
  }

  async function analyzeMemory(index) {
    if (aiStatus === "loading") return;

    if (data.personalization?.allowMemory !== true) {
      setAiNotice(
        "Izin Memory belum aktif. Buka Personalization dan aktifkan Memory terlebih dahulu."
      );
      return;
    }

    const selectedMessage = messages[index];

    if (
      !selectedMessage ||
      selectedMessage.role !== "user" ||
      !selectedMessage.text.trim()
    ) {
      setAiNotice("Pesan yang akan dianalisis tidak tersedia.");
      return;
    }

    setAiStatus("loading");
    setAiNotice("");
    setAiDraft("");
    setAiReason("");

    try {
      const context = messages
        .slice(Math.max(0, index - 11), index + 1)
        .map((message) => ({
          role: message.role === "user" ? "user" : "assistant",
          content: message.text.slice(0, 1500),
        }));

      const response = await fetch("/api/memory-analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    characterName: data.characterName || "Harmai",
    targetMessage: selectedMessage.text,
    messages: context,
    allowMemory: data.personalization?.allowMemory === true,
  }),
});

      const result = await readResponse(response);

      if (result.shouldRemember !== true) {
        setAiStatus("empty");
        setAiNotice(
          result.reason ||
            "Tidak ditemukan informasi yang cukup penting untuk disimpan."
        );
        return;
      }

      if (
        typeof result.recommendation !== "string" ||
        !result.recommendation.trim()
      ) {
        throw new Error("AI belum memberikan rekomendasi yang valid.");
      }

      setAiDraft(result.recommendation.trim().slice(0, 500));
      setAiReason(
        typeof result.reason === "string" ? result.reason : ""
      );
      setAiStatus("ready");
      setAiNotice("Periksa rekomendasi ini sebelum menyimpannya.");
    } catch (error) {
      console.error("Gagal menganalisis ingatan:", error);
      setAiStatus("error");
      setAiNotice(
        error.message ||
          "Gagal menganalisis pesan. Silakan coba lagi."
      );
    }
  }

  function saveAiDraft() {
    if (data.personalization?.allowMemory !== true) {
      setAiNotice("Aktifkan izin Memory di Personalization terlebih dahulu.");
      return;
    }

    const content = aiDraft.trim();

    if (!content) {
      setAiNotice("Rekomendasi masih kosong.");
      return;
    }

    if (content.length > 500) {
      setAiNotice("Catatan maksimal 500 karakter.");
      return;
    }

    const memories = Array.isArray(data.memories) ? data.memories : [];

    const duplicate = memories.some(
      (memory) =>
        typeof memory.content === "string" &&
        memory.content.trim().toLowerCase() === content.toLowerCase()
    );

    if (duplicate) {
      setAiNotice("Catatan ini sudah ada di Buku Ingatan.");
      return;
    }

    const now = new Date().toISOString();

    const memory = {
      id: createId(),
      content,
      category: "lainnya",
      createdAt: now,
      updatedAt: now,
      sourceText:
        typeof aiPanelIndex === "number"
          ? messages[aiPanelIndex]?.text || ""
          : "",
    };

    setData((previous) => ({
      ...previous,
      memories: [
        ...(Array.isArray(previous.memories)
          ? previous.memories
          : []),
        memory,
      ],
    }));

    closeAiPanel();
    setAiNotice("Catatan berhasil disimpan ke Buku Ingatan.");
  }

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "11px 10px",
    border: 0,
    borderRadius: 9,
    background: "transparent",
    color: "#282536",
    fontSize: 13,
    textAlign: "left",
    cursor: "pointer",
  };

  return (
    <main className="chat-page">
      <header className="chat-header">
        <div className="chat-character">
          <div className="character-avatar">
  {data.characterImage ? (
    <img src={data.characterImage} alt="" />
  ) : (
    (data.characterName || "H").slice(0, 1).toUpperCase()
  )}
</div>

          <div className="character-details">
            <strong>{data.characterName || "Character"}</strong>
            <span>
              <i />
              {isLoading ? "Thinking..." : "Your character"}
            </span>
          </div>
        </div>

        <div className="chat-header-menu">
          <button
            type="button"
            className="header-icon"
            onClick={() => setHeaderMenuOpen((open) => !open)}
            aria-label="Pengaturan"
            aria-expanded={headerMenuOpen}
            title="Pengaturan"
          >
            ⋯
          </button>

          {headerMenuOpen && (
  <div className="chat-dropdown header-dropdown">
    <button
      type="button"
      onClick={() => {
        setHeaderMenuOpen(false);
        onGoHome();
      }}
      style={menuItemStyle}
    >
      <span>⌂</span>
      <span>Beranda</span>
    </button>

    <button
      type="button"
      onClick={() => {
        setHeaderMenuOpen(false);
        onEditProfile();
      }}
      style={menuItemStyle}
    >
      <span>👤</span>
      <span>Edit Pengguna</span>
    </button>

    <button
      type="button"
      onClick={() => {
        setHeaderMenuOpen(false);
        onEditCharacter();
      }}
      style={menuItemStyle}
    >
      <span>✎</span>
      <span>Edit Karakter</span>
    </button>

    <button
      type="button"
      onClick={() => {
        setHeaderMenuOpen(false);
        onOpenPersonalization();
      }}
      style={menuItemStyle}
    >
      <span>⚙</span>
      <span>Pengaturan Tambahan</span>
    </button>
  </div>
)}
        </div>
      </header>

      <section className="chat-messages">
        <div className="chat-date">YOUR SPACE, YOUR STORY</div>

        {messages.map((message, index) => (
          <div
            key={`${index}-${message.role}`}
            className={`message-row ${
              message.role === "user" ? "user-row" : ""
            }`}
          >
            {message.role === "character" && (
              <div className="message-avatar">
  {data.characterImage ? (
    <img src={data.characterImage} alt="" />
  ) : (
    (data.characterName || "H").slice(0, 1).toUpperCase()
  )}
</div>
            )}

            <div className="message-content">
              {message.role === "user" && message.replyToText && (
                <div className="reply-quote user-reply-quote">
                  <strong>
                    Membalas {data.characterName || "karakter"}
                  </strong>
                  <span>{message.replyToText}</span>
                </div>
              )}

              <div
                className={`message-bubble ${message.role}`}
                aria-live={message.isError ? "polite" : undefined}
              >
                {message.text}
              </div>

              {message.role === "character" && (
                <>
                  <div className="message-actions">
                    <button
                      type="button"
                      className="message-action"
                      title="Buat ulang jawaban"
                      aria-label="Buat ulang jawaban"
                      disabled={isLoading}
                      onClick={() => reloadReply(index)}
                    >
                      <span className="action-symbol">↻</span>
                      <span>Reload</span>
                    </button>

                    <button
                      type="button"
                      className="message-action"
                      title="Balas pesan ini"
                      aria-label="Balas pesan ini"
                      disabled={isLoading}
                      onClick={() => startReply(message)}
                    >
                      <span className="action-symbol">↩</span>
                      <span>Reply</span>
                    </button>


                  </div>


                </>
              )}
              {message.role === "user" && (
                <>
                  <div className="message-actions">
                    <button
                      type="button"
                      className={`message-action ai-action ${
                        aiPanelIndex === index ? "active" : ""
                      }`}
                      aria-expanded={aiPanelIndex === index}
                      aria-label="Buka pemahaman AI"
                      onClick={() => toggleAiPanel(index)}
                    >
                      <span className="action-symbol">✦</span>
                      <span>AI</span>
                      <span className="action-chevron">
                        {aiPanelIndex === index ? "⌃" : "⌄"}
                      </span>
                    </button>
                  </div>

                  {aiPanelIndex === index && (
                    <section
                      className="ai-memory-panel"
                      aria-label="Pemahaman AI"
                    >
                      <div className="ai-panel-heading">
                        <div className="ai-panel-icon">✦</div>
                        <div>
                          <strong>Pemahaman AI</strong>
                          <span>
                            Periksa sebelum menyimpan ke ingatan
                          </span>
                        </div>
                      </div>

                      <div className="ai-preview-notice">
                        <strong>Pesan yang dipilih</strong>
                        <p>{message.text}</p>
                      </div>

                      {aiStatus === "idle" && (
                        <p className="ai-panel-description">
                          Minta AI mencari informasi yang mungkin berguna
                          untuk percakapan berikutnya. AI tidak akan
                          menyimpan apa pun secara otomatis.
                        </p>
                      )}

                      {aiStatus === "loading" && (
                        <div className="ai-panel-loading" role="status">
                          <span className="ai-loading-spinner" />
                          <span>
                            AI sedang memahami pesan dan konteks...
                          </span>
                        </div>
                      )}

                      {aiStatus === "ready" && (
                        <>
                          {aiReason && (
                            <div className="ai-recommendation-reason">
                              <strong>Alasan rekomendasi</strong>
                              <p>{aiReason}</p>
                            </div>
                          )}

                          <label
                            className="ai-draft-label"
                            htmlFor={`ai-draft-${index}`}
                          >
                            Rekomendasi ingatan
                          </label>

                          <textarea
                            id={`ai-draft-${index}`}
                            className="ai-draft-input"
                            value={aiDraft}
                            onChange={(event) => {
                              setAiDraft(event.target.value);
                              setAiNotice("");
                            }}
                            maxLength={500}
                            rows={3}
                            placeholder="Rekomendasi AI akan muncul di sini..."
                          />

                          <div className="ai-panel-meta">
                            <span>
                              {data.personalization?.allowMemory
                                ? "Izin Memory aktif"
                                : "Izin Memory belum aktif"}
                            </span>
                            <span>{aiDraft.length}/500</span>
                          </div>
                        </>
                      )}

                      {aiStatus === "empty" && (
                        <div className="ai-no-recommendation">
                          <strong>Belum ada ingatan yang disarankan</strong>
                          <p>
                            Tidak semua pesan perlu disimpan. Kamu bisa
                            menutup panel atau mencoba pesan lain.
                          </p>
                        </div>
                      )}

                      {aiStatus === "error" && (
                        <div className="ai-error-notice" role="alert">
                          {aiNotice}
                        </div>
                      )}

                      {aiStatus !== "error" && aiNotice && (
                        <p className="ai-panel-notice" role="status">
                          {aiNotice}
                        </p>
                      )}

                      {!data.personalization?.allowMemory && (
                        <p className="ai-panel-notice" role="status">
                          Izin Memory belum aktif. Aktifkan melalui
                          Personalization untuk menggunakan fitur ini.
                        </p>
                      )}

                      <div className="ai-panel-actions">
                        <button
                          type="button"
                          className="ai-cancel-button"
                          onClick={closeAiPanel}
                        >
                          Tutup
                        </button>

                        {aiStatus === "ready" ? (
                          <button
                            type="button"
                            className="ai-save-button"
                            disabled={
                              !aiDraft.trim() ||
                              !data.personalization?.allowMemory
                            }
                            onClick={saveAiDraft}
                          >
                            Simpan ke Buku Ingatan
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ai-save-button"
                            disabled={
                              aiStatus === "loading" ||
                              !data.personalization?.allowMemory
                            }
                            onClick={() => analyzeMemory(index)}
                          >
                            {aiStatus === "error" ||
                            aiStatus === "empty"
                              ? "Coba analisis lagi"
                              : "Analisis dengan AI"}
                          </button>
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row">
            <div className="message-avatar">
  {data.characterImage ? (
    <img src={data.characterImage} alt="" />
  ) : (
    (data.characterName || "H").slice(0, 1).toUpperCase()
  )}
</div>
            <div className="message-bubble character">
              {loadingAction.startsWith("reload-")
                ? "Membuat jawaban alternatif..."
                : "Sedang mengetik..."}
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

        {replyTo && (
          <div className="reply-composer">
            <div className="reply-composer-text">
              <strong>
                Membalas{" "}
                {replyTo.role === "character"
                  ? data.characterName || "karakter"
                  : "pesanmu"}
              </strong>
              <span>{replyTo.text}</span>
            </div>

            <button
              type="button"
              className="reply-cancel"
              onClick={() => setReplyTo(null)}
              aria-label="Batalkan reply"
              title="Batalkan reply"
            >
              ×
            </button>
          </div>
        )}

        <form className="chat-composer" onSubmit={sendMessage}>
          <button
            type="button"
            className={`plus-button ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "+"}
          </button>

          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={
              replyTo
                ? "Tulis balasan..."
                : `Message ${data.characterName || "your character"}...`
            }
            aria-label="Tulis pesan"
            disabled={isLoading}
          />

          <button
            type="submit"
            className="send-button"
            disabled={!draft.trim() || isLoading}
            aria-label="Kirim pesan"
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
