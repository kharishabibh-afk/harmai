
import "../styles/memory.css";

export default function MemoryBook({ data, onBack }) {
  return (
    <main className="memory-page">
      <header className="memory-header">
        <button className="memory-back" onClick={onBack}>
          ← <span>Back to chat</span>
        </button>
        <div className="memory-brand">HARMAI <span>MEMORY</span></div>
      </header>

      <section className="memory-content">
        <div className="memory-icon">▤</div>
        <p className="eyebrow">A SPACE FOR WHAT MATTERS</p>
        <h1>Buku <span>Ingatan.</span></h1>
        <p className="memory-description">
          A place for details that help make your conversations feel personal.
        </p>

        <article className="memory-section">
          <div className="memory-section-title">
            <span className="memory-section-icon">✦</span>
            <div>
              <h2>Character</h2>
              <p>Who they are</p>
            </div>
          </div>

          <div className="memory-detail">
            <span>Name</span>
            <strong>{data.characterName || "Not set"}</strong>
          </div>
          <div className="memory-detail">
            <span>Gender</span>
            <strong>{data.characterGender || "Not set"}</strong>
          </div>
          <div className="memory-detail">
            <span>Personality</span>
            <strong>{data.personality || "Not set"}</strong>
          </div>
        </article>

        <article className="memory-section">
          <div className="memory-section-title">
            <span className="memory-section-icon">♡</span>
            <div>
              <h2>About you</h2>
              <p>Your profile</p>
            </div>
          </div>

          <div className="memory-detail">
            <span>Name</span>
            <strong>{data.userName || "Not set"}</strong>
          </div>
          <div className="memory-detail">
            <span>Gender</span>
            <strong>{data.userGender || "Not set"}</strong>
          </div>
        </article>

        <article className="memory-section">
          <div className="memory-section-title">
            <span className="memory-section-icon">⌁</span>
            <div>
              <h2>Shared memories</h2>
              <p>Things to remember from conversations</p>
            </div>
          </div>

          <div className="memory-empty">
            <span>✧</span>
            <strong>Nothing here just yet.</strong>
            <p>Meaningful memories can appear here as this feature develops.</p>
          </div>
        </article>

        <p className="memory-footnote">
          Preview only · These details are held in the current app session.
        </p>
      </section>
    </main>
  );
}
