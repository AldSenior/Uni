// app/auth/success/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Сохраняем данные в localStorage
    localStorage.setItem("vk_code", params.get("code") || "");
    localStorage.setItem("vk_device_id", params.get("device_id") || "");

    // Перенаправляем на главную страницу
    router.push("/");
  }, []);

  return <div>Processing authorization...</div>;
}
