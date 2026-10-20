
import { useState } from "react";

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `memory-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export default function MemoryBook({
  data,
  setData,
  onBack,
  onOpenPersonalization,
}) {
  const memories = Array.isArray(data.memories) ? data.memories : [];
  const memoryEnabled = data.personalization?.allowMemory === true;

  const [content, setContent] = useState("");
  const [category, setCategory] = useState("preferensi");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  function saveMemory(event) {
    event.preventDefault();

    const text = content.trim();
    if (!text || !memoryEnabled) return;

    if (text.length > 500) {
      window.alert("Ingatan maksimal 500 karakter.");
      return;
    }

    const memory = {
      id: editingId || createId(),
      content: text,
      category,
      updatedAt: new Date().toISOString(),
    };

    setData((previous) => {
      const current = Array.isArray(previous.memories)
        ? previous.memories
        : [];

      const next = editingId
        ? current.map((item) =>
            item.id === editingId ? memory : item
          )
        : [memory, ...current];

      return { ...previous, memories: next };
    });

    setContent("");
    setCategory("preferensi");
    setEditingId(null);
  }

  function editMemory(memory) {
    setEditingId(memory.id);
    setContent(memory.content);
    setCategory(memory.category || "lainnya");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setContent("");
    setCategory("preferensi");
  }

  function deleteMemory(id) {
    const confirmed = window.confirm(
      "Hapus ingatan ini secara permanen dari penyimpanan browser?"
    );

    if (!confirmed) return;

    setData((previous) => ({
      ...previous,
      memories: (previous.memories || []).filter(
        (item) => item.id !== id
      ),
    }));

    if (editingId === id) cancelEdit();
  }

  function deleteAllMemories() {
    if (!memories.length) return;

    const confirmed = window.confirm(
      "Hapus SEMUA ingatan? Tindakan ini tidak bisa dibatalkan."
    );

    if (!confirmed) return;

    setData((previous) => ({ ...previous, memories: [] }));
    cancelEdit();
  }

  const filteredMemories = memories.filter((memory) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      memory.content.toLowerCase().includes(query) ||
      (memory.category || "").toLowerCase().includes(query)
    );
  });

  const panel = {
    background: "#fff",
    border: "1px solid #e8e6ef",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  };

  const field = {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #dedbe8",
    borderRadius: 10,
    background: "#fff",
    font: "inherit",
    color: "#282536",
  };

  const button = {
    border: 0,
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    font: "inherit",
  };

  return (
    <main
      style={{
        maxWidth: 680,
        margin: "0 auto",
        minHeight: "100vh",
        padding: "24px 18px 40px",
        background: "#faf9fc",
        color: "#282536",
        fontFamily: "inherit",
        boxSizing: "border-box",
      }}
    >
      <button
        onClick={onBack}
        style={{
          ...button,
          padding: "8px 0",
          background: "transparent",
          color: "#6554a4",
        }}
      >
        ← Kembali ke chat
      </button>

      <h1 style={{ fontSize: 28, margin: "22px 0 8px" }}>
        Buku Memory
      </h1>

      <p style={{ color: "#777386", lineHeight: 1.6 }}>
        Kamu yang menentukan informasi apa yang boleh disimpan.
        Periksa dan hapus ingatan kapan saja.
      </p>

      <section style={panel}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>
          Izin penyimpanan
        </h2>

        <p style={{ lineHeight: 1.6, color: "#777386" }}>
          Status:{" "}
          <strong style={{ color: memoryEnabled ? "#26734d" : "#a34c4c" }}>
            {memoryEnabled ? "Diizinkan" : "Nonaktif"}
          </strong>
        </p>

        {!memoryEnabled && (
          <>
            <p style={{ fontSize: 14, lineHeight: 1.6 }}>
              Aktifkan izin Memory melalui Personalization sebelum
              menambahkan ingatan baru. Ingatan yang sudah tersimpan
              tidak akan dikirim ke AI selama izin nonaktif.
            </p>

            <button
              onClick={onOpenPersonalization}
              style={{
                ...button,
                background: "#6554a4",
                color: "#fff",
              }}
            >
              Buka Personalization
            </button>
          </>
        )}

        <p style={{ fontSize: 13, color: "#777386", lineHeight: 1.5 }}>
          Penyimpanan saat ini hanya berada di browser ini. Menghapus
          data situs atau browser dapat menghilangkannya.
        </p>
      </section>

      <section style={panel}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>
          {editingId ? "Edit ingatan" : "Tambah ingatan"}
        </h2>

        <form onSubmit={saveMemory}>
          <label
            htmlFor="memory-category"
            style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
          >
            Kategori
          </label>

          <select
            id="memory-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={{ ...field, marginBottom: 14 }}
            disabled={!memoryEnabled}
          >
            <option value="preferensi">Preferensi</option>
            <option value="identitas">Tentang pengguna</option>
            <option value="keluarga">Keluarga dan hubungan</option>
            <option value="tujuan">Tujuan dan rencana</option>
            <option value="lainnya">Lainnya</option>
          </select>

          <label
            htmlFor="memory-content"
            style={{ display: "block", marginBottom: 8, fontWeight: 600 }}
          >
            Apa yang ingin diingat?
          </label>

          <textarea
            id="memory-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Contoh: Aku lebih suka jawaban yang santai dan langsung."
            rows={4}
            maxLength={500}
            style={{ ...field, resize: "vertical" }}
            disabled={!memoryEnabled}
            required
          />

          <p style={{ fontSize: 12, color: "#777386", textAlign: "right" }}>
            {content.length}/500 karakter
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={!memoryEnabled || !content.trim()}
              style={{
                ...button,
                background: memoryEnabled ? "#6554a4" : "#c7c3d3",
                color: "#fff",
                cursor: memoryEnabled ? "pointer" : "not-allowed",
              }}
            >
              {editingId ? "Simpan perubahan" : "Simpan ingatan"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{ ...button, background: "#eeedf3" }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={panel}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ fontSize: 18, margin: 0 }}>
            Ingatan tersimpan ({memories.length})
          </h2>

          {memories.length > 0 && (
            <button
              onClick={deleteAllMemories}
              style={{
                ...button,
                background: "#fff0f0",
                color: "#a33434",
              }}
            >
              Hapus semua
            </button>
          )}
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari ingatan..."
          aria-label="Cari ingatan"
          style={{ ...field, marginTop: 16 }}
        />

        <div style={{ marginTop: 16 }}>
          {filteredMemories.length === 0 ? (
            <p style={{ color: "#777386", lineHeight: 1.6 }}>
              {memories.length
                ? "Tidak ada ingatan yang cocok dengan pencarian."
                : "Belum ada ingatan. Tambahkan informasi yang ingin kamu simpan."}
            </p>
          ) : (
            filteredMemories.map((memory) => (
              <article
                key={memory.id}
                style={{
                  borderTop: "1px solid #eeeaf4",
                  padding: "16px 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background: "#efecf8",
                    color: "#6554a4",
                    borderRadius: 20,
                    padding: "4px 9px",
                    fontSize: 12,
                  }}
                >
                  {memory.category || "lainnya"}
                </span>

                <p style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {memory.content}
                </p>

                {memory.updatedAt && (
                  <p style={{ fontSize: 12, color: "#777386" }}>
                    Diperbarui{" "}
                    {new Date(memory.updatedAt).toLocaleString("id-ID")}
                  </p>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => editMemory(memory)}
                    style={{ ...button, background: "#eeedf3" }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteMemory(memory.id)}
                    style={{
                      ...button,
                      background: "#fff0f0",
                      color: "#a33434",
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
