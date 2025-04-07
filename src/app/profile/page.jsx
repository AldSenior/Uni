// app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authenticateAndFetchData = async () => {
      try {
        // 1. Получаем сохраненные данные из localStorage
        const code = localStorage.getItem("vk_code");
        const device_id = localStorage.getItem("vk_device_id");

        if (!code || !device_id) {
          throw new Error("Authorization data not found");
        }

        // 2. Обмен кода на токен
        const authResponse = await fetch("/api/vk/exchange-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, device_id }),
        });

        if (!authResponse.ok) {
          throw new Error("Failed to exchange code for token");
        }

        const { token, user_id } = await authResponse.json();

        // 3. СОХРАНЯЕМ ТОКЕН В LOCALSTORAGE
        localStorage.setItem("vk_token", token);

        // 4. Получение данных пользователя
        const userResponse = await fetch(
          `https://api.vk.com/method/users.get?user_ids=${user_id}&fields=photo_200,has_email&access_token=${token}&v=5.199`,
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();

        // 5. Сохраняем данные
        setUserData({
          ...userData.response[0],
          email: localStorage.getItem("vk_email") || undefined,
        });

        // 6. Очищаем код из localStorage
        localStorage.removeItem("vk_code");
        localStorage.removeItem("vk_device_id");
      } catch (err) {
        setError(err.message || "Unknown error");
        router.push("/auth/error");
      } finally {
        setLoading(false);
      }
    };

    authenticateAndFetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Профиль пользователя</h1>

        <div className="flex items-center gap-6 mb-8">
          {userData?.photo_200 && (
            <img
              src={userData.photo_200}
              alt="Аватар"
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {userData?.first_name} {userData?.last_name}
            </h2>
            {userData?.email && (
              <p className="text-gray-600 mt-2">{userData.email}</p>
            )}
            <p className="text-gray-500 mt-1">ID: {userData?.id}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Дополнительная информация
          </h3>
          <div className="space-y-2">
            <p>Список друзей: 256</p>
            <p>Дата регистрации: 15 января 2023</p>
            <p>Статус: Активный</p>
          </div>
        </div>
      </div>
    </div>
  );
}
