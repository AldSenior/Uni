"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useVKAuth } from "@/hooks/useVKAuth";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { checkAuth, exchangeCodeForToken, logout } = useVKAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!checkAuth()) {
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");
          const state = params.get("state");

          if (code && state) {
            try {
              await exchangeCodeForToken(code, state);
              window.history.replaceState({}, "", window.location.pathname);
            } catch (err) {
              setError("Ошибка авторизации: " + err.message);
              return;
            }
          } else {
            router.push("/");
            return;
          }
        }

        const token = localStorage.getItem("vk_access_token");

        const response = await fetch("http://localhost:3000/api/messages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          logout();
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error_description || "Ошибка при загрузке сообщений",
          );
        }

        setMessages(data.items || []);

        setProfiles(
          data.profiles.reduce(
            (acc, profile) => ({
              ...acc,
              [profile.id]: profile,
            }),
            {},
          ),
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [exchangeCodeForToken, logout, router]);

  return (
    <div>
      <h1>Сообщения</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <div>
          {messages.length === 0 ? (
            <p>Нет новых сообщений.</p>
          ) : (
            messages.map((message) => {
              const profile = profiles[message.peer_id];
              return (
                <div key={message.peer_id}>
                  <h3>
                    {profile
                      ? `${profile.first_name} ${profile.last_name}`
                      : "Неизвестный пользователь"}
                  </h3>
                  <p>{message.last_message.text}</p>
                  <p>
                    {new Date(
                      message.last_message.date * 1000,
                    ).toLocaleString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
