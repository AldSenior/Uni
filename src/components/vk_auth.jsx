'use client'
import { useEffect, useRef } from 'react'

const VK_AUTH = () => {
	const containerRef = useRef(null)

	useEffect(() => {
		const loadVKSDK = async () => {
			try {
				const script = document.createElement('script')
				script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js'
				script.async = true

				script.onload = () => {
					if (window.VKIDSDK) {
						const {
							Config,
							OneTap,
							WidgetEvents,
							OneTapInternalEvents,
							ConfigResponseMode,
							ConfigSource,
						} = window.VKIDSDK

						Config.init({
							app: 53263292,
							redirectUrl: `${window.location.origin}/api/vk/exchange-code`,
							responseMode: ConfigResponseMode.Callback,
							source: ConfigSource.Web,
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
									console.error('VKID Error:', error)
									alert('Ошибка авторизации через VK')
								})
								.on(OneTapInternalEvents.LOGIN_SUCCESS, async payload => {
									try {
										console.log('Получен код авторизации:', payload.code)

										const response = await fetch('/api/vk/exchange-code', {
											method: 'POST',
											headers: {
												'Content-Type': 'application/json',
											},
											body: JSON.stringify({
												code: payload.code,
												device_id: payload.device_id,
											}),
										})

										if (!response.ok) {
											const error = await response.json()
											throw new Error(error.message)
										}

										const { access_token } = await response.json()
										localStorage.setItem('vk_token', access_token)
										window.location.href = '/message'
									} catch (error) {
										console.error('Auth error:', error)
										alert(error.message)
									}
								})
						}
					}
				}

				document.body.appendChild(script)

				return () => {
					document.body.removeChild(script)
				}
			} catch (error) {
				console.error('Failed to load VK SDK:', error)
			}
		}

		loadVKSDK()
	}, [])

	return <div ref={containerRef} style={{ minHeight: '46px' }} />
}

export default VK_AUTH
