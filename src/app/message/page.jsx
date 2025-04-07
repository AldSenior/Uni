"use client";
import { useEffect, useState } from "react";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(
        "https://server-unimessage.onrender.com/api/messages",
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (res.ok) {
        const data = await res.json();
        setMessages(data.items); // Извлекаем сообщения из ответа
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Unknown error");
      }
    }

    fetchMessages();
  }, []);

  if (error) return <div>Ошибка: {error}</div>;

  if (!messages.length) return <div>Нет сообщений</div>;

  return (
    <div>
      <h1>Сообщения</h1>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <div>
              {message.title}: {message.body}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
