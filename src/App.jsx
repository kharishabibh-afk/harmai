
import { useState } from "react";

import Login from "./pages/Login";
import Character from "./pages/Character";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import MemoryBook from "./pages/MemoryBook";

export default function App() {
  const [page, setPage] = useState("login");

  const [data, setData] = useState({
    characterName: "",
    characterGender: "",
    personality: "",
    userName: "",
    userGender: "",
  });

  if (page === "login") {
    return <Login onLogin={() => setPage("character")} />;
  }

  if (page === "character") {
    return (
      <Character
        data={data}
        setData={setData}
        onNext={() => setPage("profile")}
      />
    );
  }

  if (page === "profile") {
    return (
      <UserProfile
        data={data}
        setData={setData}
        onNext={() => setPage("chat")}
      />
    );
  }

  if (page === "chat") {
    return (
      <Chat
        data={data}
        onOpenMemory={() => setPage("memory")}
        onEditProfile={() => setPage("profile")}
      />
    );
  }

  if (page === "memory") {
    return (
      <MemoryBook
        data={data}
        onBack={() => setPage("chat")}
      />
    );
  }

  return null;
}
