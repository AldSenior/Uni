"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function VKAuthButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const loadVKIDSDK = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js";
        script.onload = () => resolve(window.VKIDSDK);
        document.body.appendChild(script);
      });
    };

    const exchangeCodeOnServer = async (code, deviceId) => {
      try {
        const response = await fetch("https://www.unimessage.ru/api/auth/vk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, device_id: deviceId }),
          credentials: "include", // Для сохранения кук
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code on server");
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Server exchange error:", error);
        throw error;
      }
    };

    const initializeVKSDK = async () => {
      try {
        const VKID = await loadVKIDSDK();

        if (VKID) {
          VKID.Config.init({
            app: 53263292,
            redirectUrl: "https://www.unimessage.ru/messages",
            responseMode: VKID.ConfigResponseMode.Callback,
            source: VKID.ConfigSource.LOWCODE,
            scope: "messages",
          });

          const oneTap = new VKID.OneTap();

          oneTap
            .render({
              container: containerRef.current,
              showAlternativeLogin: true,
            })
            .on(VKID.WidgetEvents.ERROR, vkidOnError)
            .on(
              VKID.OneTapInternalEvents.LOGIN_SUCCESS,
              async function (payload) {
                const { code, device_id: deviceId } = payload;

                try {
                  // Обмениваем код на токен через серверный роут
                  const serverData = await exchangeCodeOnServer(code, deviceId);

                  // Вызываем оригинальный обработчик успеха
                  vkidOnSuccess(serverData);

                  // Перенаправляем на страницу сообщений
                  router.push("/messages");
                } catch (error) {
                  vkidOnError(error);
                }
              },
            );
        }
      } catch (error) {
        console.error("Error initializing VK ID SDK:", error);
        onError?.(error.message);
      }
    };

    initializeVKSDK();

    return () => {
      // Очистка при размонтировании
    };
  }, [onError, router]);

  const vkidOnSuccess = (data) => {
    console.log("VK Auth Success:", data);
    // Можно сохранять в localStorage, если нужно
    if (data.access_token) {
      localStorage.setItem("vk_access_token", data.access_token);
    }
    onSuccess(data);
  };

  const vkidOnError = (error) => {
    console.error("VK Auth Error:", error);
    onError?.(error);
  };

  return <div ref={containerRef} />;
}
