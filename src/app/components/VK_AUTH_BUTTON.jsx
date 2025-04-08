"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VKAuthButton({ onSuccess, onError }) {
  const router = useRouter();
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/healthcheck");
        if (!response.ok) throw new Error("Сервер не отвечает");
        alert("Соединение с сервером установлено");
      } catch (error) {
        console.error("Ошибка соединения:", error);
        alert("Ошибка подключения к серверу");
      }
    };

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
      const state = codeVerifier.slice(0, 43); // Используем часть codeVerifier

      sessionStorage.setItem("vk_code_verifier", codeVerifier);
      sessionStorage.setItem("vk_auth_state", state);
      alert("проверкаааа,1"); //это выводит
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
    } catch (error) {
      onError?.(error.message);
    }
  };

  useEffect(() => {
    const handleCallback = async () => {
      alert("--- STARTING CALLBACK HANDLER ---");
      const params = new URLSearchParams(window.location.search);
      alert("URL search params:", params.toString());

      const code = params.get("code");
      const state = params.get("state");
      const deviceId = params.get("device_id");

      if (!code) {
        console.error("No code parameter in URL");
        alert("кода нету");
        return;
      }

      try {
        alert("Retrieving state from sessionStorage");
        const savedState = sessionStorage.getItem("vk_auth_state");
        alert("Saved state:", savedState, "Received state:", state);

        if (state !== savedState) {
          throw new Error(
            `Invalid state: expected ${savedState}, got ${state}`,
          );
        }

        const codeVerifier = sessionStorage.getItem("vk_code_verifier");
        alert("Code verifier exists:", !!codeVerifier);
        if (!codeVerifier) throw new Error("Missing code verifier");
        //
        alert("Preparing exchange request...");
        const requestBody = new URLSearchParams({
          code,
          code_verifier: codeVerifier,
          device_id: deviceId || "",
        });
        alert("Request body:", requestBody.toString());

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

        alert("Response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tokens = await response.json();
        alert("Received tokens:", tokens);

        localStorage.setItem("vk_access_token", tokens.access_token);
        localStorage.setItem(
          "token_expires",
          Date.now() + tokens.expires_in * 1000,
        );
        alert("Tokens saved to localStorage");

        onSuccess?.(tokens);
        router.push("/messages");

        alert("Cleaning URL...");
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error) {
        console.error("Callback error:", error);
        onError?.(error.message);
      } finally {
        sessionStorage.removeItem("vk_code_verifier");
        sessionStorage.removeItem("vk_auth_state");
        alert("Session storage cleaned");
      }
    };
    //
    alert("Checking if should handle callback...");
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      alert("Code detected, starting callback handler");
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
