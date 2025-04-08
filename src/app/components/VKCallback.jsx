"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function VKCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("⏳ Обработка входа через VK...");

  useEffect(() => {
    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");

    if (!token) {
      setMessage("❌ Не найден VK токен");
      return;
    }

    axios
      .post(
        "http://localhost:3001/api/save-token",
        { token, user_id },
        { withCredentials: true },
      )
      .then(() => {
        setMessage("✅ Вход выполнен! Перенаправление...");
        router.push("/messages");
      })
      .catch((err) => {
        console.error(err);
        setMessage("❌ Ошибка входа через VK");
      });
  }, [searchParams]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-xl font-bold">{message}</h1>
    </div>
  );
}
