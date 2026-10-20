
import "../styles/onboarding.css";

export default function Character({ onNext, data, setData }) {
  function update(field, value) {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (!data.characterName.trim() || !data.personality.trim()) return;
    onNext();
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-top">
        <div className="brand-mark small">h</div>
        <span>CREATE YOUR CHARACTER</span>
        <span className="step-label">01 / 02</span>
      </div>

      <form className="onboarding-card" onSubmit={submit}>
        <div className="section-icon">✦</div>
        <p className="eyebrow">THE BEGINNING</p>
        <h1>Someone new, <span>someone yours.</span></h1>
        <p className="form-description">
          Give your character a name, an identity,
          and a personality.
        </p>

        <label className="field-label" htmlFor="characterName">
          Character name
        </label>
        <input
          id="characterName"
          className="harmai-input"
          placeholder="e.g. Raina"
          value={data.characterName}
          onChange={(event) => update("characterName", event.target.value)}
          maxLength={40}
          required
        />

        <label className="field-label">Gender</label>
        <div className="choice-row">
          {["Laki-laki", "Perempuan"].map((gender) => (
            <button
              key={gender}
              type="button"
              className={`choice-card ${data.characterGender === gender ? "selected" : ""}`}
              onClick={() => update("characterGender", gender)}
              aria-pressed={data.characterGender === gender}
            >
              <span>{gender === "Laki-laki" ? "♂" : "♀"}</span>
              {gender}
            </button>
          ))}
        </div>

        <label className="field-label" htmlFor="personality">
          Personality
        </label>
        <textarea
          id="personality"
          className="harmai-input personality-input"
          placeholder="Quiet, warm, witty, mysterious..."
          value={data.personality}
          onChange={(event) => update("personality", event.target.value)}
          maxLength={500}
          required
        />

        <button className="primary-button" type="submit">
          Continue <span>→</span>
        </button>
        <p className="step-caption">
          You can refine your character later.
        </p>
      </form>
    </main>
  );
}
