"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [userData, setUserData] = useState(null);

  // useEffect(() => {
  //   // Получение токена и информации о пользователе
  //   async function fetchUserData() {
  //     const res = await fetch("/api/profile", {
  //       method: "GET",
  //       credentials: "include", // Включаем куки
  //     });

  //     if (res.ok) {
  //       const data = await res.json();

  //       setUserData(data);
  //     } else {
  //       console.error("Failed to fetch user data");
  //     }
  //   }

  //   fetchUserData();
  // }, []);

  // if (!userData) {
  //   return <div>Загрузка...</div>;
  // }

  return (
    <div>
      <h1>Профиль пользователя</h1>
      <p>Имя: {userData.first_name}</p>
      <p>Фамилия: {userData.last_name}</p>
    </div>
  );
}
