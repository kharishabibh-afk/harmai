
import { useState } from "react";
import "../styles/home.css";

export default function Home({
  data,
  onAddCharacter,
  onOpenCharacter,
  onEditProfile,
  onLogout,
  onEditCharacter,
  onDeleteCharacter,
}) {
  const [sortBy, setSortBy] = useState("terbaru");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openCharacterMenu, setOpenCharacterMenu] = useState(null);

  const characters = data?.characters || [];

  const recentCharacters = characters.filter(
    (character) => character.lastChattedAt
  );

  const publicCharacters = data?.publicCharacters || [];

  const sortedPublicCharacters = [...publicCharacters].sort((a, b) => {
    if (sortBy === "populer") {
      return (b.popularity || 0) - (a.popularity || 0);
    }

    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <main className="home-page">
      <header className="home-header">
        <div className="home-brand">
          HARMAI<span>.</span>
        </div>

        <div className="home-menu-wrap">
          <button
            className="home-menu-button"
            type="button"
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            ☰
          </button>

          {menuOpen && (
            <div className="home-menu">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEditProfile?.();
                }}
              >
                Edit Pengguna
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout?.();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="home-welcome">
        <p className="home-eyebrow">YOUR PERSONAL SPACE</p>

        <h1>
          Hai, <span>{data?.userName || "Teman"}.</span>
        </h1>

        <p>Siapa yang ingin kamu ajak bicara hari ini?</p>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <h2>Karakter yang kamu chat</h2>
            <p>Lanjutkan percakapanmu.</p>
          </div>

          <button
            className="home-add-button"
            type="button"
            onClick={onAddCharacter}
          >
            + Tambah Karakter
          </button>
        </div>

        <div className="home-character-list">
          {recentCharacters.map((character) => (
            <div
              className="home-character-wrapper"
              key={character.id}
            >
              <button
                className="home-character-card"
                type="button"
                onClick={() => onOpenCharacter?.(character)}
              >
                <div className="home-avatar">
  {character.characterImage ? (
    <img src={character.characterImage} alt="" />
  ) : (
    (character.name || "?").charAt(0).toUpperCase()
  )}
</div>

                <span>{character.name || "Karakter"}</span>
                <small>Lanjutkan chat</small>
              </button>

              <div className="home-character-actions">
                <button
                  className="home-character-menu-button"
                  type="button"
                  aria-label={`Menu ${character.name || "karakter"}`}
                  aria-expanded={openCharacterMenu === character.id}
                  onClick={() =>
                    setOpenCharacterMenu((current) =>
                      current === character.id ? null : character.id
                    )
                  }
                >
                  ⋯
                </button>

                {openCharacterMenu === character.id && (
                  <div className="home-character-dropdown">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenCharacterMenu(null);
                        onEditCharacter?.(character);
                      }}
                    >
                      Edit karakter
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenCharacterMenu(null);
                        onDeleteCharacter?.(character);
                      }}
                    >
                      Hapus karakter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            className="home-character-card home-create-card"
            type="button"
            onClick={onAddCharacter}
          >
            <div className="home-avatar home-plus-avatar">+</div>
            <span>Buat karakter</span>
            <small>Karakter baru milikmu</small>
          </button>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading home-public-heading">
          <div>
            <h2>Karakter Publik</h2>
            <p>Temukan karakter dari komunitas Harmai.</p>
          </div>

          <div className="home-sort">
            <button
              type="button"
              className={sortBy === "terbaru" ? "active" : ""}
              onClick={() => setSortBy("terbaru")}
            >
              Terbaru
            </button>

            <button
              type="button"
              className={sortBy === "populer" ? "active" : ""}
              onClick={() => setSortBy("populer")}
            >
              Populer
            </button>
          </div>
        </div>

        {sortedPublicCharacters.length === 0 ? (
          <div className="home-empty">
            <div className="home-empty-icon">✧</div>

            <h3>Karakter publik akan muncul di sini</h3>

            <p>
              Kamu bisa membuat karakter sendiri dan memilih Publik
              agar pengguna lain dapat menemukannya.
            </p>
          </div>
        ) : (
          <div className="home-public-grid">
            {sortedPublicCharacters.map((character) => (
              <button
                className="home-public-card"
                type="button"
                key={character.id}
                onClick={() => onOpenCharacter?.(character)}
              >
                <div className="home-public-avatar">
                  {character.photo ? (
                    <img src={character.photo} alt="" />
                  ) : (
                    (character.name || "?").charAt(0).toUpperCase()
                  )}
                </div>

                <div className="home-public-info">
                  <h3>{character.name || "Karakter"}</h3>

                  <p>
                    {character.description ||
                      "Kenali karakter ini lebih dekat."}
                  </p>

                  <small>
                    {character.creatorName || "Komunitas Harmai"}
                  </small>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <footer className="home-footer">
        HARMAI · A SPACE OF YOUR OWN
      </footer>
    </main>
  );
}
