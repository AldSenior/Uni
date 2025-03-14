'use client' // Указываем, что это клиентский компонент
import React, { useEffect } from 'react'

// Типы для данных авторизации VKID
interface VKIDSuccessData {
	access_token: string
	expires_in: number
	user_id: number
	email?: string
}

interface VKIDError {
	error: string
	error_description: string
}

interface VKIDPayload {
	code: string
	device_id: string
}

export const VK_AUTH: React.FC = () => {
	const handleVKIDSuccess = (data: VKIDSuccessData) => {
		console.log('Успешная авторизация:', data)
	}

	const handleVKIDError = (error: VKIDError) => {
		console.error('Ошибка авторизации:', error)
	}

	useEffect(() => {
		// Загружаем скрипт динамически
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js'
		script.async = true
		script.onload = () => {
			if ('VKIDSDK' in window) {
				const VKID = (window as any).VKIDSDK

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
						(payload: VKIDPayload) => {
							const { code, device_id } = payload
							VKID.Auth.exchangeCode(code, device_id)
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
