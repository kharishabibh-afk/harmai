
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Character from "./pages/Character";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import MemoryBook from "./pages/MemoryBook";
import Personalization from "./pages/Personalization";

const STORAGE_KEY = "harmai_app_state";

const initialData = {
  characterName: "",
  characterGender: "",
  personality: "",
  userName: "",
  userGender: "",
  personalization: {
    responseStyle: "casual",
    responseLength: "balanced",
    allowMemory: false,
    restrictedTopics: "",
  },
};

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      return {
        page: parsed.page || "login",
        data: {
          ...initialData,
          ...(parsed.data || {}),
          personalization: {
            ...initialData.personalization,
            ...(parsed.data?.personalization || {}),
          },
        },
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

  useEffect(() => {
    window.history.replaceState({ page }, "", window.location.href);

    function handlePopState(event) {
      if (event.state?.page) {
        setPage(event.state.page);
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
        onOpenPersonalization={() => navigate("personalization")}
      />
    );
  }

  if (page === "personalization") {
    return (
      <Personalization
        data={data}
        setData={setData}
        onBack={() => navigate("chat")}
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
