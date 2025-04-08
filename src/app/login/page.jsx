"use client";
import React from "react";

export default function LoginPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Вход через VK</h1>
      <a
        href="http://localhost:3001/auth/vk"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Войти через VK
      </a>
    </div>
  );
}
