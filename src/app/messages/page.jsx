"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const deviceId = params.get("device_id");

      if (!code || !state) return;

      try {
        // Получаем данные из localStorage
        const savedState = localStorage.getItem("vk_auth_state");
        const codeVerifier = localStorage.getItem("vk_code_verifier");

        if (state !== savedState) throw new Error("Invalid state");
        if (!codeVerifier) throw new Error("Missing code verifier");

        const response = await fetch("/api/exchange-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            device_id: deviceId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Ошибка авторизации");
        }

        const { access_token, expires_in } = await response.json();

        // Сохраняем токен и время экспирации
        localStorage.setItem("vk_access_token", access_token);
        localStorage.setItem("token_expires", Date.now() + expires_in * 1000);

        // Очищаем URL после успешной авторизации
        window.history.replaceState({}, document.title, "/messages");
      } catch (error) {
        console.error("Ошибка авторизации:", error);
        // Полная очистка при ошибке
        localStorage.removeItem("vk_code_verifier");
        localStorage.removeItem("vk_auth_state");
        localStorage.removeItem("vk_access_token");
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  const getUserName = (peerId) => {
    const profile = profiles[peerId];
    return profile
      ? `${profile.first_name} ${profile.last_name}`
      : `ID ${peerId}`;
  };

  const getUserPhoto = (peerId) => {
    return profiles[peerId]?.photo_100 || "/default-avatar.jpg";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ваши сообщения</h1>

      {messages.length > 0 ? (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={`${msg.peer_id}_${msg.last_message.id}`}
              className="border-b border-gray-200 pb-4"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={getUserPhoto(msg.peer_id)}
                  alt={getUserName(msg.peer_id)}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium">{getUserName(msg.peer_id)}</h3>
                    {msg.unread_count > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {msg.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800">{msg.last_message.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.last_message.date * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Нет сообщений для отображения
        </div>
      )}
    </div>
  );
}
