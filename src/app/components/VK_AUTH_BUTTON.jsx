"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Отдельная функция для генерации state
const generateState = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 43);
};

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
      const state = generateState(); // Используем отдельную генерацию

      // Сохраняем в localStorage вместо sessionStorage
      localStorage.setItem("vk_code_verifier", codeVerifier);
      localStorage.setItem("vk_auth_state", state);

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
