"use client";
import { useEffect, useState } from "react";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          "https://server-unimessage.onrender.com/api/messages",
          {
            credentials: "include",
          },
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch messages");

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
      <h1>Сообщения</h1>
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
