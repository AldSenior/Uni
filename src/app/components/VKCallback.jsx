"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVKAuth } from "../../hooks/useVKAuth";
export default function VKCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { exchangeCodeForToken, error, isLoading } = useVKAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code && state) {
      exchangeCodeForToken(code, state)
        .then(() => router.push("/messages"))
        .catch((err) => {
          console.error("VK токен обмен не удался:", err.message);
        });
    }
  }, [searchParams]);

  return (
    <div className="p-4 text-center">
      <p>⏳ Обрабатываем вход через VK...</p>
      {isLoading && <p>Загрузка...</p>}
      {error && <p className="text-red-500">Ошибка: {error}</p>}
    </div>
  );
}
