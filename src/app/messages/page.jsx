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
    const checkAuth = () => {
      const token = localStorage.getItem("vk_access_token");
      const expires = localStorage.getItem("token_expires");

      if (!token || !expires || Date.now() > parseInt(expires)) {
        // localStorage.removeItem("vk_access_token");
        // localStorage.removeItem("token_expires");
        // router.push("/");
        alert("что нахуй?");
        return false;
      }
      return true;
    };

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!checkAuth()) return;

        const token = localStorage.getItem("vk_access_token");

        const response = await fetch("http://localhost:3000/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // localStorage.removeItem("vk_access_token");
          // localStorage.removeItem("token_expires");
          // router.push("/");
          //
          alert("че блять 401");
          return;
        }

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
        console.error("Ошибка:", err);
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
      : `ID ${peerId}`;
  };

  const getUserPhoto = (peerId) => {
    return profiles[peerId]?.photo_100 || "/default-avatar.jpg";
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ваши сообщения</h1>
        <button
          onClick={() => {
            localStorage.removeItem("vk_access_token");
            localStorage.removeItem("token_expires");
            router.push("/");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Выйти
        </button>
      </div>

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
                  className="w-10 h-10 rounded-full object-cover"
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
                    {formatDate(msg.last_message.date)}
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
