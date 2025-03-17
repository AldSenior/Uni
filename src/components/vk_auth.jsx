'use client'
import { useEffect, useRef } from 'react'

const VK_AUTH = () => {
	const containerRef = useRef(null)

	useEffect(() => {
		const loadVKSDK = async () => {
			try {
				// Динамический импорт SDK
				const { default: VKID } = await import('@vkid/sdk')
				const {
					Config,
					OneTap,
					WidgetEvents,
					OneTapInternalEvents,
					ConfigSource,
					ConfigResponseMode,
				} = VKID

				// Конфигурация SDK
				Config.init({
					app: process.env.NEXT_PUBLIC_VK_CLIENT_ID || 53263292,
					redirectUrl:
						process.env.NEXT_PUBLIC_VK_REDIRECT_URI ||
						'https://www.unimessage.ru/api/vk/exchange-code',
					responseMode: ConfigResponseMode.Callback,
					source: ConfigSource.LOWCODE, // Исправлено на верный регистр
					scope: 'email messages', // Исправлен формат scope
				})

				const oneTap = new OneTap()

				if (containerRef.current) {
					oneTap
						.render({
							container: containerRef.current,
							showAlternativeLogin: true,
						})
						.on(WidgetEvents.ERROR, error => {
							console.error('Ошибка виджета:', error)
							alert(`Ошибка авторизации: ${error.error_description}`)
						})
						.on(OneTapInternalEvents.LOGIN_SUCCESS, async payload => {
							try {
								const response = await fetch('/api/vk/exchange-code', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({ code: payload.code }),
								})

								if (!response.ok) {
									const errorData = await response.json()
									throw new Error(errorData.error || 'Ошибка сервера')
								}

								const { access_token, user_id } = await response.json()

								// Безопасное хранение токена
								sessionStorage.setItem('vk_token', access_token)

								// Перенаправление с очисткой истории
								window.location.replace('/message')
							} catch (error) {
								console.error('Ошибка авторизации:', error)
								alert(error.message || 'Произошла ошибка при авторизации')
							}
						})
				}
			} catch (error) {
				console.error('Ошибка загрузки VK SDK:', error)
				alert('Не удалось загрузить модуль авторизации')
			}
		}

		loadVKSDK()
	}, [])

	return (
		<div
			ref={containerRef}
			style={{
				minHeight: '46px',
				display: 'flex',
				justifyContent: 'center',
				margin: '20px 0',
			}}
		/>
	)
}

export default VK_AUTH
