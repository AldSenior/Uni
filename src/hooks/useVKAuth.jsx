"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useVKAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startAuth = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:3001/auth/vk"; // Серверный редирект
  };

  const saveToken = async (token, user_id) => {
    try {
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
    }
  };

  const logout = () => {
    localStorage.removeItem("vk_access_token");
    router.push("/");
  };

  return {
    startAuth,
    saveToken,
    logout,
    isLoading,
    error,
  };
}
