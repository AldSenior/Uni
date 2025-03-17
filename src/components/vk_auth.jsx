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
					app: 53263292, // Ваш app_id
					redirectUrl: 'https://www.unimessage.ru/api/vk/exchange-code',
					responseMode: ConfigResponseMode.Callback,
					source: ConfigSource.LOWCODE,
					scope: 'email, messages',
				})

				const oneTap = new OneTap()

				if (containerRef.current) {
					oneTap
						.render({
							container: containerRef.current,
							showAlternativeLogin: true,
						})
						.on(WidgetEvents.ERROR, error => {
							console.error('Widget error:', error)
							alert(`Auth error: ${error.error_description}`)
						})
						.on(OneTapInternalEvents.LoginSuccess, async payload => {
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
									throw new Error(errorData.error || 'Auth failed')
								}

								const { access_token, user_id } = await response.json()

								// Безопасное хранение токена
								sessionStorage.setItem('vk_token', access_token)
								window.location.href = '/message'
							} catch (error) {
								console.error('Auth error:', error)
								alert(error.message)
							}
						})
				}
			} catch (error) {
				console.error('Failed to load VK SDK:', error)
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
