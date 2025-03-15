'use client'
import React, { useEffect } from 'react'

const VKOneTap: React.FC = () => {
	useEffect(() => {
		// Проверяем, что VKIDSDK доступен в window
		if (!window.VKIDSDK) {
			console.error('VKID SDK не загружен')
			return
		}

		const { Config, OneTap, Auth, WidgetEvents, OneTapInternalEvents } =
			window.VKIDSDK

		// Инициализация VKID SDK
		Config.init({
			app: 53263292, // Ваш app_id
			redirectUrl: 'https://unimessage.ru/vk-callback', // Ваш redirectUrl
			// responseMode: Config.ResponseMode.Callback,
			// source: Config.Source.LOWCODE,
			scope: '', // Укажите необходимые разрешения, если нужно
		})

		// Создаем экземпляр One Tap
		const oneTap = new OneTap()

		// Рендерим One Tap в контейнер
		oneTap
			.render({
				container: document.getElementById(
					'vkid-one-tap-container'
				) as HTMLElement, // Контейнер для One Tap
				showAlternativeLogin: true, // Показывать альтернативные способы входа
			})
			.on(WidgetEvents.ERROR, vkidOnError) // Обработка ошибок
			.on(
				OneTapInternalEvents.LOGIN_SUCCESS,
				(payload: { code: string; device_id: string }) => {
					// Обработка успешной авторизации
					const { code, device_id } = payload

					// Обмен кода на токен
					Auth.exchangeCode(code, device_id)
						.then(vkidOnSuccess)
						.catch(vkidOnError)
				}
			)

		// Функция для обработки успешной авторизации
		function vkidOnSuccess(data: {
			access_token: string
			user_id: number
			expires_in: number
		}) {
			console.log('Успешная авторизация:', data)
			// Здесь можно отправить данные на ваш сервер для создания сессии
			fetch('/api/auth/vk', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})
				.then(response => response.json())
				.then(result => {
					console.log('Ответ сервера:', result)
				})
		}

		// Функция для обработки ошибок
		function vkidOnError(error: unknown) {
			console.error('Ошибка авторизации:', error)
		}

		// Очистка при размонтировании компонента
		return () => {
			oneTap.destroy()
		}
	}, [])

	return (
		<div>
			<div id='vkid-one-tap-container'></div>
		</div>
	)
}

export default VKOneTap
