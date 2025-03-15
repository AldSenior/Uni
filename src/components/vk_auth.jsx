'use client'
import { useEffect, useRef } from 'react'

const VK_AUTH = () => {
	const containerRef = useRef(null)

	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js'
		script.async = true
		script.onload = () => {
			if ('VKIDSDK' in window) {
				const {
					Config,
					OneTap,
					Auth,
					WidgetEvents,
					OneTapInternalEvents,
					ConfigResponseMode,
					ConfigSource,
				} = window.VKIDSDK

				// Инициализация VKID SDK
				Config.init({
					app: 53263292, // Ваш app_id
					redirectUrl: 'https://www.unimessage.ru/vk-callback', // Ваш redirectUrl
					responseMode: ConfigResponseMode.Callback,
					source: ConfigSource.LOWCODE,
					scope: 'messages', // Укажите необходимые разрешения
				})

				// Создаем экземпляр One Tap
				const oneTap = new OneTap()

				// Рендерим One Tap в контейнер
				if (containerRef.current) {
					oneTap
						.render({
							container: containerRef.current,
							showAlternativeLogin: true,
						})
						.on(WidgetEvents.ERROR, vkidOnError)
						.on(OneTapInternalEvents.LOGIN_SUCCESS, async payload => {
							const { code, device_id } = payload

							try {
								// Отправляем код на сервер для обмена на токен
								const response = await fetch('/api/vk/exchange-code', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({ code, device_id }),
								})

								if (!response.ok) {
									throw new Error('Ошибка при обмене кода на токен')
								}

								const data = await response.json()

								// Сохраняем токен в localStorage
								localStorage.setItem('vk_token', data.access_token)

								// Перенаправляем пользователя на страницу сообщений
								window.location.href = '/message'
							} catch (error) {
								console.error('Ошибка:', error)
							}
						})
				}

				// Функция для обработки ошибок
				function vkidOnError(error) {
					console.error('Ошибка авторизации:', error)
				}
			}
		}

		document.body.appendChild(script)

		// Очистка при размонтировании компонента
		return () => {
			document.body.removeChild(script)
		}
	}, [])

	return <div ref={containerRef}></div>
}

export default VK_AUTH
