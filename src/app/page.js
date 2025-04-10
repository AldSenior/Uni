"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("vk_token");
    const savedUser = localStorage.getItem("vk_user");

    if (token && savedUser) {
      router.push("/messages");
      return;
    }
  }, [router]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("vk_user", data.user);
        localStorage.setItem("vk_token", data.token); // 💾 сохраняем токен
      }
      console.log(data);
      setResponse(data);
      router.push("/messages");
    } catch (err) {
      setResponse({ status: "error", message: "Ошибка подключения к серверу" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ maxWidth: 400, margin: "50px auto", fontFamily: "sans-serif" }}
    >
      <h2>VK Авторизация</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Логин (email / телефон)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 16px", width: "100%" }}
        >
          {loading ? "Авторизация..." : "Войти"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: 20 }}>
          {response.status === "success" ? (
            <div style={{ color: "green" }}>
              ✅ Успешно авторизован: <strong>{response.user}</strong>
            </div>
          ) : (
            <div style={{ color: "red" }}>❌ Ошибка: {response.message}</div>
          )}
        </div>
      )}
    </div>
  );
}
