"use client";
import { useState, useEffect } from "react";
import VKAuthButton from "./components/VK_AUTH_BUTTON";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const handleSuccess = (data) => {
    setUser(data.user);
    setError(null);
    // Здесь можно перенаправить пользователя или обновить состояние приложения
    console.log("Auth success:", data.user);
  };

  const handleError = (error) => {
    setError(error.message || "Ошибка авторизации");
    console.error("Auth error:", error);
  };
  useEffect(() => {
    const handleHashChange = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      if (hashParams.has("code")) {
        const code = hashParams.get("code");
        const device_id = hashParams.get("device_id");

        // Сохраняем в localStorage
        localStorage.setItem("vk_code", code);
        localStorage.setItem("vk_device_id", device_id);

        // Очищаем хэш
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Вход через VK ID</h1>

      <div className="max-w-md mx-auto">
        <VKAuthButton onSuccess={handleSuccess} onError={handleError} />

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {user && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold">Вы вошли как:</h2>
            <div className="flex items-center mt-2">
              {user.photo && (
                <img
                  src={user.photo}
                  alt="User avatar"
                  className="w-12 h-12 rounded-full mr-3"
                />
              )}
              <div>
                <p>
                  {user.firstName} {user.lastName}
                </p>
                {user.email && (
                  <p className="text-sm text-gray-600">{user.email}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
