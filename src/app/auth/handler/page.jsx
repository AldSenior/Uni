// app/auth/handler/page.tsx
"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const device_id = searchParams.get("device_id");

    if (code) {
      localStorage.setItem("vk_code", code);
      if (device_id) localStorage.setItem("vk_device_id", device_id);

      // Обработка авторизации
      fetch("/api/vk/exchange-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, device_id }),
      }).then(() => router.push("/profile"));
      // .catch(() => router.push("/auth/error"));
    } else {
      router.push("/auth/error");
    }
  }, []);

  return <div>Processing authorization...</div>;
}

export default function AuthHandlerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthHandlerContent />
    </Suspense>
  );
}
