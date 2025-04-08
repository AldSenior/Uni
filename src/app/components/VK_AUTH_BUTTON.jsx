"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VKAuthButton({ onSuccess, onError }) {
  const router = useRouter();

  // Перенесём проверку соединения в отдельную функцию
  const checkServerConnection = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/healthcheck");
      if (!response.ok) throw new Error("Сервер не отвечает");
      console.log("Соединение с сервером установлено");
    } catch (error) {
      console.error("Ошибка соединения:", error);
      onError?.(error.message);
    }
  };

  useEffect(() => {
    checkServerConnection();
  }, []);

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
      const state = codeVerifier.slice(0, 43);

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
      console.log("--- STARTING CALLBACK HANDLER ---");
      const params = new URLSearchParams(window.location.search);
      console.log("URL search params:", params.toString());

      const code = params.get("code");
      const state = params.get("state");
      const deviceId = params.get("device_id");

      if (!code) {
        console.error("No code parameter in URL");
        return;
      }

      try {
        console.log("Retrieving state from sessionStorage");
        const savedState = sessionStorage.getItem("vk_auth_state");
        console.log("Saved state:", savedState, "Received state:", state);

        if (state !== savedState) {
          throw new Error(
            `Invalid state: expected ${savedState}, got ${state}`,
          );
        }

        const codeVerifier = sessionStorage.getItem("vk_code_verifier");
        console.log("Code verifier exists:", !!codeVerifier);
        if (!codeVerifier) throw new Error("Missing code verifier");

        console.log("Preparing exchange request...");
        const requestBody = new URLSearchParams({
          code,
          code_verifier: codeVerifier,
          device_id: deviceId || "",
        });

        console.log("Sending request to exchange code...");
        const response = await fetch(
          "http://localhost:3000/api/exchange-code",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: requestBody,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, ${errorText}`,
          );
        }

        const tokens = await response.json();
        console.log("Received tokens:", tokens);

        localStorage.setItem("vk_access_token", tokens.access_token);
        localStorage.setItem(
          "token_expires",
          Date.now() + tokens.expires_in * 1000,
        );

        onSuccess?.(tokens);
        router.push("/messages");

        // Очищаем URL от параметров
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } catch (error) {
        console.error("Callback error:", error);
        onError?.(error.message);
      } finally {
        sessionStorage.removeItem("vk_code_verifier");
        sessionStorage.removeItem("vk_auth_state");
      }
    };

    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      console.log("Code detected, starting callback handler");
      handleCallback();
    }
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
