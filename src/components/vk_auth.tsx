'use client' // Указываем, что это клиентский компонент
import React, { useEffect } from 'react'

export const VK_AUTH: React.FC = () => {
	const handleVKIDSuccess = (data: any) => {
		console.log('Успешная авторизация:', data)
	}

	const handleVKIDError = (error: any) => {
		console.error('Ошибка авторизации:', error)
	}

	useEffect(() => {
		// Загружаем скрипт динамически
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js'
		script.async = true
		script.onload = () => {
			if ('VKIDSDK' in window) {
				const VKID: any = window.VKIDSDK

				VKID.Config.init({
					app: 53263292,
					redirectUrl: 'https://unimessage.ru/vk-callback',
					responseMode: VKID.ConfigResponseMode.Callback,
					source: VKID.ConfigSource.LOWCODE,
					scope: '', // Заполните нужными доступами по необходимости
				})

				const oneTap = new VKID.OneTap()

				oneTap
					.render({
						container: document.getElementById('vkid-container'), // Контейнер для виджета
						showAlternativeLogin: true,
					})
					.on(VKID.WidgetEvents.ERROR, handleVKIDError)
					.on(
						VKID.OneTapInternalEvents.LOGIN_SUCCESS,
						(payload: { code: any; device_id: any }) => {
							const code = payload.code
							const deviceId = payload.device_id

							VKID.Auth.exchangeCode(code, deviceId)
								.then(handleVKIDSuccess)
								.catch(handleVKIDError)
						}
					)
			}
		}
		document.body.appendChild(script)

		return () => {
			// Очистка при размонтировании компонента
			document.body.removeChild(script)
		}
	}, [])

	return (
		<div>
			<div id='vkid-container'></div> {/* Контейнер для виджета VKID */}
		</div>
	)
}
