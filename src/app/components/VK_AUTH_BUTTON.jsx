"use client";
import { useEffect } from "react";
import { useVKAuth } from "../../hooks/useVKAuth";

export default function VKAuthButton({ onSuccess, onError }) {
  const { startAuth, exchangeCodeForToken, isLoading, error } = useVKAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code) return;

      try {
        const tokens = await exchangeCodeForToken(code, state);
        onSuccess?.(tokens);
        window.history.replaceState({}, "", window.location.pathname);
      } catch (err) {
        onError?.(err.message);
      }
    };

    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      handleCallback();
    }
  }, [exchangeCodeForToken, onSuccess, onError]);

  return (
    <button
      onClick={startAuth}
      disabled={isLoading}
      style={{
        padding: "10px 20px",
        backgroundColor: "#0077FF",
        color: "white",
        opacity: isLoading ? 0.7 : 1,
      }}
    >
      {isLoading ? "Загрузка..." : "Войти через VK ID"}
    </button>
  );
}
