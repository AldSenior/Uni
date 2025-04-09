"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVKAuth } from "../../hooks/useVKAuth";

export default function VKCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { saveToken } = useVKAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const user_id = searchParams.get("user_id");

    if (token && user_id) {
      saveToken(token, user_id).then(() => {
        router.push("/dashboard");
      });
    } else {
      router.push("/?error=auth_failed");
    }
  }, [searchParams]);

  return (
    <div className="p-4 text-center">
      <p>🔄 Обработка VK ID авторизации...</p>
    </div>
  );
}
