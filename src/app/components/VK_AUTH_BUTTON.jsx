"use client";
import { useEffect, useRef } from "react";

export default function VKAuthButton({ onSuccess, onError }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadVKIDSDK = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js"; // Убедитесь, что указана правильная версия
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
            redirectUrl: "https://www.unimessage.ru/message",
            responseMode: VKID.ConfigResponseMode.Callback,
            source: VKID.ConfigSource.LOWCODE,
            scope: "message", // Заполните нужными доступами по необходимости
          });

          const oneTap = new VKID.OneTap();

          oneTap
            .render({
              container: containerRef.current,
              showAlternativeLogin: true,
            })
            .on(VKID.WidgetEvents.ERROR, vkidOnError)
            .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload) {
              const { code, device_id: deviceId } = payload;

              VKID.Auth.exchangeCode(code, deviceId)
                .then(vkidOnSuccess)
                .catch(vkidOnError);
            });
        }
      } catch (error) {
        console.error("Error initializing VK ID SDK:", error);
        onError?.(error.message);
      }
    };

    initializeVKSDK();

    return () => {
      // Здесь можно выполнить очистку, если это необходимо.
      // Например, отменить подписку на события, хотя, возможно, это не требуется для вашего виджета.
    };
  }, [onError]);

  const vkidOnSuccess = (data) => {
    console.log("VK Auth Success:", data);
    localStorage.setItem("vk_access_token", data.access_token);

    onSuccess(data); // Обработка успешной авторизации
  };

  const vkidOnError = (error) => {
    console.error("VK Auth Error:", error);
    onError?.(error); // Обработка ошибки
  };

  return <div ref={containerRef} />;
}
