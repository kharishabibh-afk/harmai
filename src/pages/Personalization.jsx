
import { useState } from "react";

const defaults = {
  responseStyle: "casual",
  responseLength: "balanced",
  allowMemory: false,
  restrictedTopics: "",
};

export default function Personalization({ data, setData, onBack }) {
  const [settings, setSettings] = useState({
    ...defaults,
    ...(data.personalization || {}),
  });

  function updateSetting(key, value) {
    const next = { ...settings, [key]: value };

    setSettings(next);
    setData((previous) => ({
      ...previous,
      personalization: next,
    }));
  }

  const panel = {
    background: "#fff",
    border: "1px solid #e8e6ef",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  };

  const label = {
    display: "block",
    fontWeight: 600,
    marginBottom: 8,
    color: "#282536",
  };

  const selectStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #dedbe8",
    background: "#fff",
    fontSize: 15,
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
          border: 0,
          background: "transparent",
          padding: "8px 0",
          cursor: "pointer",
          fontSize: 15,
          color: "#6554a4",
        }}
      >
        ← Kembali ke chat
      </button>

      <h1 style={{ fontSize: 28, margin: "22px 0 8px" }}>
        Personalization
      </h1>

      <p style={{ color: "#777386", lineHeight: 1.6, marginBottom: 26 }}>
        Atur cara {data.characterName || "Harmai"} berbicara dan tentukan
        batasan yang kamu inginkan.
      </p>

      <section style={panel}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>
          Gaya percakapan
        </h2>

        <label style={label} htmlFor="response-style">
          Cara berbicara
        </label>

        <select
          id="response-style"
          value={settings.responseStyle}
          onChange={(event) =>
            updateSetting("responseStyle", event.target.value)
          }
          style={selectStyle}
        >
          <option value="casual">Santai dan natural</option>
          <option value="warm">Hangat dan suportif</option>
          <option value="direct">Langsung dan to the point</option>
          <option value="formal">Rapi dan formal</option>
          <option value="humorous">Ceria dan humoris</option>
        </select>

        <label style={{ ...label, marginTop: 18 }} htmlFor="response-length">
          Panjang jawaban
        </label>

        <select
          id="response-length"
          value={settings.responseLength}
          onChange={(event) =>
            updateSetting("responseLength", event.target.value)
          }
          style={selectStyle}
        >
          <option value="short">Singkat</option>
          <option value="balanced">Seimbang</option>
          <option value="detailed">Terperinci</option>
        </select>
      </section>

      <section style={panel}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>
          Izin Memory
        </h2>

        <p style={{ color: "#777386", lineHeight: 1.6 }}>
          Tentukan apakah Harmai boleh menggunakan fitur untuk menyimpan
          hal-hal penting tentangmu. Riwayat chat tetap terpisah dari Memory.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            lineHeight: 1.5,
          }}
        >
          <input
            type="checkbox"
            checked={settings.allowMemory}
            onChange={(event) =>
              updateSetting("allowMemory", event.target.checked)
            }
            style={{ width: 19, height: 19, flexShrink: 0 }}
          />

          <span>
            <strong>Izinkan Memory</strong>
            <br />
            <span style={{ color: "#777386", fontSize: 14 }}>
              Nonaktif secara default sampai kamu mengizinkannya.
            </span>
          </span>
        </label>
      </section>

      <section style={panel}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>
          Batasan pribadi
        </h2>

        <label style={label} htmlFor="restricted-topics">
          Topik yang ingin dihindari
        </label>

        <textarea
          id="restricted-topics"
          value={settings.restrictedTopics}
          onChange={(event) =>
            updateSetting("restrictedTopics", event.target.value)
          }
          placeholder="Contoh: jangan membahas pekerjaan kecuali aku yang memulai..."
          rows={4}
          style={{
            ...selectStyle,
            resize: "vertical",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />

        <p style={{ color: "#777386", fontSize: 13, lineHeight: 1.5 }}>
          Ini adalah preferensi percakapan, bukan pemblokiran teknis. Kita
          akan menghubungkannya ke AI pada tahap berikutnya.
        </p>
      </section>

      <p style={{ color: "#777386", fontSize: 13, textAlign: "center" }}>
        Perubahan tersimpan otomatis di browser ini.
      </p>
    </main>
  );
}
