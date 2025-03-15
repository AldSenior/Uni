'use client'
import { useEffect, useRef } from 'react'

const VK_AUTH = () => {
	const containerRef = useRef(null)

	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/@vkid/sdk@3.0.0/dist-sdk/umd/index.js'
		script.async = true
		script.onload = () => {
			if ('VKIDSDK' in window) {
				const {
					Config,
					OneTap,
					WidgetEvents,
					OneTapInternalEvents,
					ConfigResponseMode,
					ConfigSource,
				} = window.VKIDSDK

				// Инициализация VKID SDK
				Config.init({
					app: 53263292,
					redirectUrl: 'https://www.unimessage.ru/api/vk/exchange-code',
					responseMode: ConfigResponseMode.Callback,
					source: ConfigSource.LOWCODE,
					scope: 'messages', // Исправлено на messages
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
						.on(WidgetEvents.ERROR, error => {
							console.error('Ошибка виджета:', error)
						})
						.on(OneTapInternalEvents.LOGIN_SUCCESS, async payload => {
							try {
								// Отправляем код на сервер
								const response = await fetch('/api/vk/exchange-code', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({ code: payload.code }),
								})

								if (!response.ok) {
									throw new Error('Ошибка сервера')
								}

								const { access_token } = await response.json()

								// Сохраняем токен и перенаправляем
								localStorage.setItem('vk_token', access_token)
								window.location.href = '/message'
							} catch (error) {
								console.error('Ошибка авторизации:', error)
								alert('Ошибка авторизации!')
							}
						})
				}
			}
		}

		document.body.appendChild(script)

		return () => {
			document.body.removeChild(script)
		}
	}, [])

	return <div ref={containerRef} style={{ minHeight: '46px' }}></div>
}

export default VK_AUTH
