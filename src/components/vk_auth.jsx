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

// export default VK_AUTH'use client'
'use client'
import { useEffect, useRef, useState } from 'react'

const VK_AUTH = () => {
	const containerRef = useRef(null)
	const [error, setError] = useState(null)

	useEffect(() => {
		const initVKSDK = async () => {
			try {
				// Динамическая загрузка SDK
				await loadScript(
					'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js'
				)

				const {
					Config,
					OneTap,
					WidgetEvents,
					OneTapInternalEvents,
					ConfigSource,
					ConfigResponseMode,
				} = window.VKIDSDK

				// Конфигурация SDK
				Config.init({
					app: 53263292,
					redirectUrl: `https://www.unimessage.ru/api/vk/exchange-code`,
					responseMode: ConfigResponseMode.Callback,
					source: ConfigSource.LOWCODE,
					scope: 'messages',
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
							setError(error.error_description)
						})
						.on(OneTapInternalEvents.LOGIN_SUCCESS, async payload => {
							try {
								const response = await fetch('/api/vk/exchange-code', {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										'X-Requested-With': 'XMLHttpRequest',
									},
									body: JSON.stringify({ code: payload.code }),
									credentials: 'include',
								})

								const data = await response.json()

								if (!response.ok) throw new Error(data.error || 'Server error')
								if (!data.access_token) throw new Error('Missing access token')

								// Безопасное хранение токена
								sessionStorage.setItem('vk_token', data.access_token)
								window.location.replace('/message')
							} catch (err) {
								console.error('Auth error:', err)
								setError(err.message)
							}
						})
				}
			} catch (err) {
				console.error('SDK initialization error:', err)
				setError('Failed to initialize authentication')
			}
		}

		const loadScript = src =>
			new Promise((resolve, reject) => {
				const script = document.createElement('script')
				script.src = src
				script.async = true
				script.onload = resolve
				script.onerror = reject
				document.body.appendChild(script)
			})

		initVKSDK()

		return () => {
			const scripts = document.querySelectorAll('script[src*="vkid/sdk"]')
			scripts.forEach(script => script.remove())
		}
	}, [])

	return (
		<div>
			<div
				ref={containerRef}
				style={{
					minHeight: '46px',
					display: 'flex',
					justifyContent: 'center',
					margin: '20px 0',
				}}
			/>
			{error && (
				<div className='error-message'>
					{error} <button onClick={() => setError(null)}>×</button>
				</div>
			)}
		</div>
	)
}

export default VK_AUTH
