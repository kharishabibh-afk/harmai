
import "../styles/onboarding.css";

export default function UserProfile({ onNext, data, setData }) {
  function update(field, value) {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (!data.userName.trim() || !data.userGender) return;
    onNext();
  }

  return (
    <main className="onboarding-page">
      <div className="onboarding-top">
        <div className="brand-mark small">h</div>
        <span>YOUR PROFILE</span>
        <span className="step-label">02 / 02</span>
      </div>

      <form className="onboarding-card" onSubmit={submit}>
        <div className="section-icon">♡</div>
        <p className="eyebrow">A LITTLE ABOUT YOU</p>
        <h1>And what should <span>I call you?</span></h1>
        <p className="form-description">
          Let's make this space feel a little more personal.
        </p>

        <label className="field-label" htmlFor="userName">
          Your name
        </label>
        <input
          id="userName"
          className="harmai-input"
          placeholder="What should your character call you?"
          value={data.userName}
          onChange={(event) =>
            setData((previous) => ({
              ...previous,
              userName: event.target.value,
            }))
          }
          maxLength={40}
          required
        />

        <label className="field-label">Gender</label>
        <div className="choice-row">
          {["Laki-laki", "Perempuan"].map((gender) => (
            <button
              key={gender}
              type="button"
              className={`choice-card ${data.userGender === gender ? "selected" : ""}`}
              onClick={() => update("userGender", gender)}
              aria-pressed={data.userGender === gender}
            >
              <span>{gender === "Laki-laki" ? "♂" : "♀"}</span>
              {gender}
            </button>
          ))}
        </div>

        <button className="primary-button" type="submit">
          Enter Harmai <span>→</span>
        </button>

        <button
          className="text-button"
          type="button"
          onClick={() => window.history.back()}
        >
          Back
        </button>
      </form>
    </main>
  );
}
