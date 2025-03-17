// 'use client'
// import { useEffect, useRef } from 'react'
// const VK_AUTH = () => {
// 	const containerRef = useRef(null)

// 	useEffect(() => {
// 		const loadVKSDK = async () => {
// 			try {
// 				// Динамический импорт SDK
// 				const vkid = await import('@vkid/sdk')
// 				const {
// 					Config,
// 					OneTap,
// 					WidgetEvents,
// 					OneTapInternalEvents,
// 					ConfigSource,
// 					ConfigResponseMode,
// 				} = vkid

// 				// Конфигурация SDK
// 				Config.init({
// 					app: 53263292, // Ваш app_id
// 					redirectUrl: 'https://www.unimessage.ru/api/vk/exchange-code',
// 					responseMode: ConfigResponseMode.Callback,
// 					source: ConfigSource.LOWCODE,
// 					scope: 'email, messages',
// 				})

// 				const oneTap = new OneTap()

// 				if (containerRef.current) {
// 					oneTap
// 						.render({
// 							container: containerRef.current,
// 							showAlternativeLogin: true,
// 						})
// 						.on(WidgetEvents.ERROR, error => {
// 							console.error('Widget error:', error)
// 							alert(`Auth error: ${error.error_description}`)
// 						})
// 						.on(OneTapInternalEvents.LoginSuccess, async payload => {
// 							try {
// 								const response = await fetch('/api/vk/exchange-code', {
// 									method: 'POST',
// 									headers: {
// 										'Content-Type': 'application/json',
// 									},
// 									body: JSON.stringify({ code: payload.code }),
// 								})

// 								if (!response.ok) {
// 									const errorData = await response.json()
// 									throw new Error(errorData.error || 'Auth failed')
// 								}

// 								const { access_token, user_id } = await response.json()

// 								// Безопасное хранение токена
// 								sessionStorage.setItem('vk_token', access_token)
// 								window.location.href = '/message'
// 							} catch (error) {
// 								console.error('Auth error:', error)
// 								alert(error.message)
// 							}
// 						})
// 				}
// 			} catch (error) {
// 				console.error('Failed to load VK SDK:', error)
// 			}
// 		}

// 		loadVKSDK()
// 	}, [])

// 	return (
// 		<div
// 			ref={containerRef}
// 			style={{
// 				minHeight: '46px',
// 				display: 'flex',
// 				justifyContent: 'center',
// 				margin: '20px 0',
// 			}}
// 		/>
// 	)
// }

// export default VK_AUTH
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
					WidgetEvents,
					OneTapInternalEvents,
					ConfigSource,
					ConfigResponseMode,
				} = window.VKIDSDK

				Config.init({
					app: 53263292,
					redirectUrl: 'https://www.unimessage.ru/api/vk/exchange-code',
					responseMode: ConfigResponseMode.Callback,
					source: ConfigSource.LOWCODE,
					scope: 'messages', // Исправлено с message на messages
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
								console.log('Получен код авторизации:', payload.code)

								// 3. Добавляем обработку ошибок сервера
								const response = await fetch('/api/vk/exchange-code', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({ code: payload.code }),
								})

								const responseData = await response.json()

								if (!response.ok) {
									throw new Error(
										responseData.error || 'Неизвестная ошибка сервера'
									)
								}

								// 4. Проверяем наличие токена
								if (!responseData.access_token) {
									throw new Error('Токен не был получен')
								}

								console.log('Успешно получен токен:', responseData)
								localStorage.setItem('vk_token', responseData.access_token)
								window.location.href = '/message'
							} catch (error) {
								console.error('Ошибка авторизации:', error)
								alert(`Ошибка авторизации: ${error.message}`)
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

	return (
		<div
			ref={containerRef}
			style={{
				minHeight: '46px',
				display: 'flex',
				justifyContent: 'center',
				margin: '20px 0',
			}}
		></div>
	)
}

export default VK_AUTH
