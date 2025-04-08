"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useVKAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Генерация code_verifier длиной до 128 символов
  const generateCodeVerifier = () => {
    const array = new Uint8Array(64);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 128);
  };

  // Генерация code_challenge на основе code_verifier (PKCE)
  const generateCodeChallenge = async (codeVerifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  // Запуск авторизации через VK
  const startAuth = async () => {
    try {
      setIsLoading(true);
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = codeVerifier.slice(0, 43);

      sessionStorage.setItem("vk_code_verifier", codeVerifier);
      sessionStorage.setItem("vk_auth_state", state);

      const authParams = new URLSearchParams({
        response_type: "code",
        client_id: "53263292",
        redirect_uri: "https://uni-eo0p.onrender.com/messages",
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        state: state,
        scope: "messages",
      });

      window.location.href = `https://id.vk.com/authorize?${authParams.toString()}`;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Обмен кода на токен
  const exchangeCodeForToken = async (code, state) => {
    try {
      setIsLoading(true);
      setError(null);

      const savedState = sessionStorage.getItem("vk_auth_state");
      if (state !== savedState) {
        throw new Error(`Invalid state: expected ${savedState}, got ${state}`);
      }

      const codeVerifier = sessionStorage.getItem("vk_code_verifier");
      if (!codeVerifier) throw new Error("Missing code verifier");

      const requestBody = `code=${encodeURIComponent(
        code,
      )}&code_verifier=${encodeURIComponent(codeVerifier)}`;

      const response = await fetch("http://localhost:3000/api/exchange-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestBody,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const tokens = await response.json();

      localStorage.setItem("vk_access_token", tokens.access_token);
      localStorage.setItem(
        "token_expires",
        Date.now() + tokens.expires_in * 1000,
      );

      sessionStorage.removeItem("vk_code_verifier");
      sessionStorage.removeItem("vk_auth_state");

      return tokens;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка наличия валидного токена
  const checkAuth = () => {
    const token = localStorage.getItem("vk_access_token");
    const expires = localStorage.getItem("token_expires");

    if (!token || !expires || Date.now() > parseInt(expires)) {
      return false;
    }
    return true;
  };

  // Выход из системы
  const logout = () => {
    localStorage.removeItem("vk_access_token");
    localStorage.removeItem("token_expires");
    router.push("/");
  };

  return {
    startAuth,
    exchangeCodeForToken,
    checkAuth,
    logout,
    isLoading,
    error,
  };
}
