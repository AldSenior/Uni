"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/status", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setStatus(data.response?.text || "Статус не найден"))
      .catch((err) => console.error("Ошибка получения статуса VK:", err));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Добро пожаловать!</h1>
      <p>🟢 VK статус: {status || "Загрузка..."}</p>
    </div>
  );
}
