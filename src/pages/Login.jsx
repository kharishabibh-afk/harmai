
import "../styles/login.css";

export default function Login({ onLogin }) {
  return (
    <main className="login-page">
      <div className="login-glow login-glow-one" />
      <div className="login-glow login-glow-two" />

      <section className="login-card">
        <div className="brand-mark">h</div>

        <p className="eyebrow">YOUR PERSONAL SPACE</p>
        <h1>Meet your <span>Harmai.</span></h1>
        <p className="login-description">
          A space for conversations, stories,
          and a character that feels like yours.
        </p>

        <div className="login-preview">
          <div className="preview-avatar">✦</div>
          <div>
            <strong>Your next favorite person.</strong>
            <p>Start with a character of your own.</p>
          </div>
        </div>

        <button className="google-button" onClick={onLogin}>
          <span className="google-g">G</span>
          Continue with Google
          <span className="button-arrow">→</span>
        </button>

        <p className="login-note">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </section>

      <footer className="login-footer">
        HARMAI <span>·</span> A SPACE OF YOUR OWN
      </footer>
    </main>
  );
}
