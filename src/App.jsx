
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Character from "./pages/Character";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import MemoryBook from "./pages/MemoryBook";

const STORAGE_KEY = "harmai_app_state";

const initialData = {
  characterName: "",
  characterGender: "",
  personality: "",
  userName: "",
  userGender: "",
};

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      return {
        page: parsed.page || "login",
        data: { ...initialData, ...(parsed.data || {}) },
      };
    }
  } catch (error) {
    console.error("Gagal membaca data Harmai:", error);
  }

  return {
    page: "login",
    data: initialData,
  };
}

export default function App() {
  const [savedState] = useState(loadSavedState);

  const [page, setPage] = useState(savedState.page);
  const [data, setData] = useState(savedState.data);

  // Simpan halaman terakhir dan data pengguna.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ page, data })
      );
    } catch (error) {
      console.error("Gagal menyimpan data Harmai:", error);
    }
  }, [page, data]);

  // Dukungan tombol Back dan Forward browser.
  useEffect(() => {
    window.history.replaceState({ page }, "", window.location.href);

    function handlePopState() {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPage(parsed.page || "login");
          setData({ ...initialData, ...(parsed.data || {}) });
        } catch (error) {
          console.error("Gagal memulihkan halaman:", error);
        }
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigate(nextPage) {
    window.history.pushState({ page: nextPage }, "", window.location.href);
    setPage(nextPage);
  }

  if (page === "login") {
    return <Login onLogin={() => navigate("character")} />;
  }

  if (page === "character") {
    return (
      <Character
        data={data}
        setData={setData}
        onNext={() => navigate("profile")}
      />
    );
  }

  if (page === "profile") {
    return (
      <UserProfile
        data={data}
        setData={setData}
        onNext={() => navigate("chat")}
      />
    );
  }

  if (page === "chat") {
    return (
      <Chat
        data={data}
        onOpenMemory={() => navigate("memory")}
        onEditProfile={() => navigate("profile")}
      />
    );
  }

  if (page === "memory") {
    return (
      <MemoryBook
        data={data}
        onBack={() => navigate("chat")}
      />
    );
  }

  return <Login onLogin={() => navigate("character")} />;
}
