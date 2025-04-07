"use client";
import { useEffect, useState } from "react";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // 1. Получаем токен из localStorage
        const token = localStorage.getItem("vk_access_token");

        if (!token) {
          throw new Error("Необходима авторизация");
        }

        // 2. Отправляем запрос на сервер с токеном
        const response = await fetch("http://localhost:3000/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Ошибка при загрузке сообщений");
        }

        // 3. Устанавливаем полученные сообщения
        setMessages(data.data.conversations);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMessages();
  }, []);

  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h1>Ваши сообщения</h1>
      {messages.length > 0 ? (
        <ul>
          {messages.map((msg) => (
            <li key={msg.conversation.peer.id}>
              <div>{msg.last_message.text}</div>
              <small>
                {new Date(msg.last_message.date * 1000).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <div>Нет сообщений</div>
      )}
    </div>
  );
}
