"use client";

export const dynamic = "force-dynamic"; // 👈 это отключает пререндер

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function VKCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");

    if (token) {
      axios
        .post(
          "http://localhost:3001/api/save-token",
          { token, user_id },
          { withCredentials: true },
        )
        .then(() => router.push("/messages"))
        .catch((err) => console.error("Ошибка сохранения токена", err));
    }
  }, []);

  return <p>Обработка входа через VK...</p>;
}
