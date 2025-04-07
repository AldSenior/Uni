"use client";
import { useEffect, useState } from "react";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Отправляем запрос с credentials для работы с куками
        const response = await fetch("http://localhost:3000/api/messages", {
          credentials: "include", // Важно для передачи кук
        });

        if (response.status === 401) {
          // Если не авторизован - перенаправляем на логин
          window.location.href = "/";
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error_description || "Ошибка при загрузке сообщений",
          );
        }

        // Устанавливаем данные
        setMessages(data.items || []);

        // Преобразуем профили в удобный формат
        if (data.profiles) {
          const profilesMap = data.profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          setProfiles(profilesMap);
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const getUserName = (peerId) => {
    const profile = profiles[peerId];
    if (!profile) return `Пользователь ${peerId}`;
    return `${profile.first_name} ${profile.last_name}`;
  };

  const getUserPhoto = (peerId) => {
    return profiles[peerId]?.photo_100 || "/default-avatar.jpg";
  };

  if (loading) return <div className="loading">Загрузка сообщений...</div>;

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="messages-container">
      <h1 className="messages-title">Ваши сообщения</h1>

      {messages.length > 0 ? (
        <ul className="messages-list">
          {messages.map((msg) => (
            <li
              key={`${msg.peer_id}_${msg.last_message.id}`}
              className="message-item"
            >
              <div className="message-header">
                <img
                  src={getUserPhoto(msg.peer_id)}
                  alt={getUserName(msg.peer_id)}
                  className="message-avatar"
                />
                <div className="message-info">
                  <span className="message-sender">
                    {getUserName(msg.peer_id)}
                  </span>
                  {msg.unread_count > 0 && (
                    <span className="unread-badge">{msg.unread_count}</span>
                  )}
                </div>
              </div>
              <div className="message-text">{msg.last_message.text}</div>
              <div className="message-time">
                {new Date(msg.last_message.date * 1000).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-messages">Нет новых сообщений</div>
      )}

      <style jsx>{`
        .messages-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .messages-title {
          font-size: 24px;
          margin-bottom: 20px;
        }
        .messages-list {
          list-style: none;
          padding: 0;
        }
        .message-item {
          border-bottom: 1px solid #eee;
          padding: 15px 0;
        }
        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .message-info {
          display: flex;
          align-items: center;
        }
        .message-sender {
          font-weight: 500;
        }
        .unread-badge {
          background: #5181b8;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 12px;
          margin-left: 8px;
        }
        .message-text {
          margin-bottom: 5px;
        }
        .message-time {
          font-size: 12px;
          color: #666;
        }
        .loading,
        .no-messages {
          text-align: center;
          padding: 20px;
          color: #666;
        }
        .error {
          color: #f44336;
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
