"use client";
import { useVKAuth } from "../../hooks/useVKAuth";

export default function VKAuthButton() {
  const { startAuth, isLoading } = useVKAuth();

  return (
    <button
      onClick={startAuth}
      disabled={isLoading}
      style={{
        padding: "10px 20px",
        backgroundColor: "#0077FF",
        color: "white",
        borderRadius: "8px",
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      {isLoading ? "Загрузка..." : "Войти через VK ID"}
    </button>
  );
}
