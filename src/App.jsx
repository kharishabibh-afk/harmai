
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Character from "./pages/Character";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import MemoryBook from "./pages/MemoryBook";
import Personalization from "./pages/Personalization";
import Home from "./pages/Home";

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
const [editingCharacterId, setEditingCharacterId] = useState(null);
const [activeCharacterId, setActiveCharacterId] = useState(null);

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
  return (
    <Login
      onLogin={() => navigate(data.userName ? "home" : "profile")}
    />
  );
}

  
  function saveCharacter() {
    const now = Date.now();
    const existingCharacter = (data.characters || []).find(
      (item) => item.id === editingCharacterId
    );

    const character = {
      id: editingCharacterId || `character-${now}`,
      name: data.characterName.trim(),
      gender: data.characterGender || "",
      description: data.characterDescription || "",
      personality: data.personality || "",
      speechStyle: data.characterSpeechStyle || "casual",
      responseLength: data.characterResponseLength || "medium",
      instructions: data.characterInstructions || "",
      visibility: data.characterVisibility || "private",
      characterImage: data.characterImage || "",
      characterImagePrompt: data.characterImagePrompt || "",
      createdAt: existingCharacter?.createdAt || now,
      lastChattedAt: now,
    };

    setData((previous) => ({
      ...previous,
      characters: editingCharacterId
        ? (previous.characters || []).map((item) =>
            item.id === editingCharacterId ? character : item
          )
        : [...(previous.characters || []), character],
    }));

    setEditingCharacterId(null);
setActiveCharacterId(character.id);
navigate("chat");
  }
  
  if (page === "character") {
    return (
      <Character
        data={data}
        setData={setData}
        editingCharacterId={editingCharacterId}
        onCancelEdit={() => {
          setEditingCharacterId(null);
          navigate("chat");
        }}
        onNext={saveCharacter}
      />
    );
  }

if (page === "profile") {
  return (
    <UserProfile
      data={data}
      setData={setData}
      onNext={() => navigate("home")}
    />
  );
}

  
  if (page === "chat") {
    return (
      <Chat
        data={data}
        setData={setData}
        onOpenMemory={() => navigate("memory")}
        onGoHome={() => navigate("home")}
        onEditProfile={() => navigate("profile")}
        
onEditCharacter={() => {
  const character = (data.characters || []).find(
    (item) =>
      item.id === activeCharacterId ||
      item.name === data.characterName
  );

  if (!character) {
    return;
  }

  setEditingCharacterId(character.id);
  setActiveCharacterId(character.id);

  setData((previous) => ({
    ...previous,
    characterName: character.name,
    characterGender: character.gender || "",
    characterDescription: character.description || "",
    characterImage: character.characterImage || "",
    characterImagePrompt: character.characterImagePrompt || "",
    personality: character.personality || "",
    characterSpeechStyle: character.speechStyle || "casual",
    characterResponseLength: character.responseLength || "medium",
    characterInstructions: character.instructions || "",
    characterVisibility: character.visibility || "private",
  }));

  navigate("character");
}}

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
      setData={setData}
      onBack={() => navigate("chat")}
      onOpenPersonalization={() => navigate("personalization")}
    />
  );
}

  if (page === "home") {
    return (
      <Home
        data={data}
        
onAddCharacter={() => navigate("character")}
onOpenCharacter={(character) => {
  setActiveCharacterId(character.id);
  setData((prev) => ({
    ...prev,

    characterName: character.name,
    characterGender: character.gender || "",
    characterDescription: character.description || "",
    characterImage: character.characterImage || "",
    characterImagePrompt: character.characterImagePrompt || "",
    personality: character.personality || "",
    characterSpeechStyle: character.speechStyle || "casual",
    characterResponseLength: character.responseLength || "medium",
    characterInstructions: character.instructions || "",
    characterVisibility: character.visibility || "private",
    characters: (prev.characters || []).map((item) =>
      item.id === character.id
        ? { ...item, lastChattedAt: Date.now() }
        : item
    ),
  }));
  navigate("chat");
}}
        
onEditCharacter={(character) => {
  setEditingCharacterId(character.id);
  setActiveCharacterId(character.id);

  setData((previous) => ({
    ...previous,
    characterName: character.name || "",
    characterGender: character.gender || "",
    characterDescription: character.description || "",
    personality: character.personality || "",
    characterSpeechStyle: character.speechStyle || "casual",
    characterResponseLength: character.responseLength || "medium",
    characterInstructions: character.instructions || "",
    characterVisibility: character.visibility || "private",
  }));

  navigate("character");
}}
onDeleteCharacter={(character) => {
  const confirmed = window.confirm(
    `Hapus karakter "${character.name}"? Karakter ini tidak akan muncul lagi di daftar Home.`
  );

  if (!confirmed) return;

  setData((previous) => ({
    ...previous,
    characters: (previous.characters || []).filter(
      (item) => item.id !== character.id
    ),
  }));

  if (activeCharacterId === character.id) {
    setActiveCharacterId(null);
  }
}}
onEditProfile={() => navigate("profile")}
onLogout={() => navigate("login")}
      />
    );
  }

  return <Login onLogin={() => navigate("character")} />;
}
