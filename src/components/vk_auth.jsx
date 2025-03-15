'use client'
import { useEffect, useRef } from 'react'
//sad
const VK_AUTH = () => {
	const containerRef = useRef(null)

	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/@vkid/sdk@3.0.0/dist-sdk/umd/index.js'
		script.async = true
		script.onload = () => {
			if ('VKIDSDK' in window) {
				const { Config, OneTap, WidgetEvents, OneTapInternalEvents } =
					window.VKIDSDK

				// Инициализация
				Config.init({
					app: 53263292,
					redirectUrl: 'https://www.unimessage.ru/api/vk/exchange-code',
					scope: 'messages',
				})

				const oneTap = new OneTap()

				if (containerRef.current) {
					oneTap
						.render({ container: containerRef.current })
						.on(WidgetEvents.ERROR, console.error)
						.on(OneTapInternalEvents.LOGIN_SUCCESS, async payload => {
							// Отправляем код на сервер
							const response = await fetch('/api/vk/exchange-code', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ code: payload.code }),
							})

							const data = await response.json()

							if (data.access_token) {
								localStorage.setItem('vk_token', data.access_token)
								window.location.href = '/message'
							}
						})
				}
			}
		}

		document.body.appendChild(script)
		return () => document.body.removeChild(script)
	}, [])

	return <div ref={containerRef}></div>
}

export default VK_AUTH
