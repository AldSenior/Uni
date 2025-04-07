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
            .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, async (payload) => {
              const { code, device_id: deviceId } = payload;

              try {
                // 1. Отправляем код на ваш сервер для обмена на токен
                const response = await fetch(
                  "https://server-unimessage.onrender.com/api/exchange-code",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ code, device_id: deviceId }),
                  },
                );

                if (!response.ok) {
                  throw new Error("Failed to exchange code for token");
                }

                const authData = await response.json();
                vkidOnSuccess(authData);

                // 2. Сохраняем токен в localStorage
                localStorage.setItem("vk_access_token", authData.access_token);

                // 3. Перенаправляем на страницу сообщений
                router.push("/messages");
              } catch (error) {
                vkidOnError(error);
              }
            });
        }
      } catch (error) {
        console.error("Error initializing VK ID SDK:", error);
        onError?.(error.message);
      }
    };

    initializeVKSDK();

    return () => {
      const widget = document.querySelector(".VkIdWebSdk__button");
      if (widget) widget.remove();
    };
  }, [onError, router]);

  const vkidOnSuccess = (data) => {
    console.log("VK Auth Success:", data);
    onSuccess(data);
  };

  const vkidOnError = (error) => {
    console.error("VK Auth Error:", error);
    onError?.(error);
  };

  return <div ref={containerRef} />;
}
