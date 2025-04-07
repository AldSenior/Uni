// "use client";
// import { useEffect, useRef } from "react";
// import {
//   Config,
//   OneTap,
//   Auth,
//   WidgetEvents,
//   OneTapInternalEvents,
//   ConfigResponseMode,
//   ConfigSource,
// } from "@vkid/sdk";

// export default function VKAuthButton({ onSuccess, onError }) {
//   const containerRef = useRef(null);

//   useEffect(() => {
//     // Инициализация VK ID SDK
//     Config.init({
//       app: 53263292, // Ваш app_id
//       redirectUrl: "https://www.unimessage.ru/profile", // Адаптивный redirect URL", // Адаптивный redirect URL
//       responseMode: ConfigResponseMode.Callback,
//       source: ConfigSource.LOWCODE,
//       scope: "", // Нужные разрешения
//     });

//     const oneTap = new OneTap();

//     // Рендеринг виджета
//     if (containerRef.current) {
//       oneTap
//         .render({
//           container: containerRef.current,
//           showAlternativeLogin: true,
//         })
//         .on(WidgetEvents.ERROR, handleError)
//         .on(OneTapInternalEvents.LOGIN_SUCCESS, handleLoginSuccess);
//     }

//     return () => {
//       oneTap.unmount();
//     };
//   }, []);

//   const handleLoginSuccess = async (payload) => {
//     try {
//       const response = await fetch(
//         "https://server-unimessage.onrender.com/api/vk/exchange-code",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//           body: JSON.stringify({
//             code: payload.code,
//             device_id: payload.device_id,
//           }),
//           credentials: "include", // Если используете куки
//         },
//       );

//       // Обрабатываем случаи, когда ответ не JSON
//       const text = await response.text();
//       let data;
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch (e) {
//         throw new Error(text || "Invalid server response");
//       }

//       if (!response.ok) {
//         throw new Error(data.error || "Request failed");
//       }

//       if (!data.success) {
//         throw new Error(data.error || "VK auth failed");
//       }

//       console.log("Auth success:", data);
//       onSuccess(data);
//     } catch (error) {
//       console.error("Auth error:", error);
//       onError(error.message);
//     }
//   };

//   const handleError = (error) => {
//     console.error("VK Auth error:", error);
//     onError?.(error);
//   };

//   return <div ref={containerRef} />;
// }

"use client"; // Убедитесь, что вы используете его в компонентах, которые должны быть отрендерены на клиенте

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
            redirectUrl: "https://www.unimessage.ru/api/vk/exchange-code",
            responseMode: VKID.ConfigResponseMode.Callback,
            source: VKID.ConfigSource.LOWCODE,
            scope: "", // Заполните нужными доступами по необходимости
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
    onSuccess(data); // Обработка успешной авторизации
  };

  const vkidOnError = (error) => {
    console.error("VK Auth Error:", error);
    onError?.(error); // Обработка ошибки
  };

  return <div ref={containerRef} />;
}
