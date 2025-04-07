"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("vk_access_token");
        console.log(token);
        if (!token) {
          router.push("/");
          return;
        }

        const response = await fetch("http://localhost:3000/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // if (response.status === 401) {
        //   localStorage.removeItem("vk_access_token");
        //   router.push("/");
        //   return;
        // }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error_description || "Ошибка при загрузке сообщений",
          );
        }

        setMessages(data.items || []);

        if (data.profiles) {
          const profilesMap = data.profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          setProfiles(profilesMap);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [router]);

  const getUserName = (peerId) => {
    const profile = profiles[peerId];
    return profile
      ? `${profile.first_name} ${profile.last_name}`
      : `ID${peerId}`;
  };

  const getUserPhoto = (peerId) => {
    return profiles[peerId]?.photo_100 || "/default-avatar.jpg";
  };

  if (loading) return <div className="loading">Загрузка сообщений...</div>;
  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <div className="messages-container">
      <h1>Ваши сообщения</h1>

      {messages.length > 0 ? (
        <ul className="messages-list">
          {messages.map((msg) => (
            <li key={`${msg.peer_id}_${msg.last_message.id}`}>
              <div className="message-header">
                <img
                  src={getUserPhoto(msg.peer_id)}
                  alt={getUserName(msg.peer_id)}
                  width={40}
                  height={40}
                />
                <div>
                  <div>{getUserName(msg.peer_id)}</div>
                  <div>{msg.last_message.text}</div>
                  <small>
                    {new Date(msg.last_message.date * 1000).toLocaleString()}
                  </small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>Нет сообщений</div>
      )}
    </div>
  );
}
