"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VKAuthButton({ onSuccess, onError }) {
  const router = useRouter();

  const generateCodeVerifier = () => {
    const array = new Uint8Array(64);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 128);
  };

  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const handleLogin = async () => {
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = codeVerifier.slice(0, 43); // Используем часть codeVerifier

      sessionStorage.setItem("vk_code_verifier", codeVerifier);
      sessionStorage.setItem("vk_auth_state", state);

      const authParams = new URLSearchParams({
        response_type: "code",
        client_id: "53263292",
        redirect_uri: "https://www.unimessage.ru/messages",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: state,
        scope: "messages",
      });

      window.location.href = `https://id.vk.com/authorize?${authParams.toString()}`;
    } catch (error) {
      onError?.(error.message);
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const deviceId = params.get("device_id");

      if (!code) return; // Прекращаем выполнение если нет кода

      try {
        const savedState = sessionStorage.getItem("vk_auth_state");
        if (state !== savedState) throw new Error("Invalid state");

        const codeVerifier = sessionStorage.getItem("vk_code_verifier");
        if (!codeVerifier) throw new Error("Missing code verifier");

        const response = await fetch(
          "http://localhost:3000/api/exchange-code",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              code_verifier: codeVerifier,
              device_id: deviceId,
            }),
          },
        );

        if (!response.ok) throw new Error("Token exchange failed");

        const tokens = await response.json();
        localStorage.setItem("vk_access_token", tokens.access_token);
        // Добавляем сохранение времени экспирации
        localStorage.setItem(
          "token_expires",
          Date.now() + tokens.expires_in * 1000,
        );

        onSuccess?.(tokens);
        router.push("/messages");
        // Очищаем URL от параметров авторизации
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error) {
        onError?.(error.message);
      } finally {
        sessionStorage.removeItem("vk_code_verifier");
        sessionStorage.removeItem("vk_auth_state");
      }
    };

    handleCallback();
  }, [onSuccess, onError, router]);

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: "10px 20px",
        backgroundColor: "#0077FF",
        color: "white",
      }}
    >
      Войти через VK ID
    </button>
  );
}
