"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useVKAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔗 Начать авторизацию через серверный редирект
  const startAuth = async () => {
    try {
      setIsLoading(true);
      window.location.href = "http://localhost:3001/auth/vk"; // 👈 локальный сервер
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Сохранить токен (после редиректа на фронт)
  const saveToken = async (token, user_id) => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3001/api/save-token", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, user_id }),
      });

      if (!res.ok) throw new Error("Ошибка сохранения токена");

      localStorage.setItem("vk_access_token", token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 Проверка авторизации
  const checkAuth = () => {
    const token = localStorage.getItem("vk_access_token");
    return Boolean(token);
  };

  // 🚪 Выход
  const logout = () => {
    localStorage.removeItem("vk_access_token");
    router.push("/");
  };

  return {
    startAuth,
    saveToken,
    checkAuth,
    logout,
    isLoading,
    error,
  };
}
