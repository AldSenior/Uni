const VK_AUTH = () => {
	const containerRef = useRef(null)

	useEffect(() => {
		// Загружаем скрипт динамически
		const script = document.createElement('script')
		script.src = 'https://unpkg.com/@vkid/sdk@<3.0.0/dist-sdk/umd/index.js'
		script.async = true
		script.onload = () => {
			if ('VKIDSDK' in window) {
				const {
					Config,
					OneTap,
					Auth,
					WidgetEvents,
					OneTapInternalEvents,
					ConfigResponseMode,
					ConfigSource,
				} = window.VKIDSDK

				// Инициализация VKID SDK
				Config.init({
					app: 53263292, // Ваш app_id
					redirectUrl: 'https://www.unimessage.ru/vk-callback', // Ваш redirectUrl
					responseMode: ConfigResponseMode.Callback,
					source: ConfigSource.LOWCODE,
					scope: 'message', // Укажите необходимые разрешения, если нужно
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
						.on(WidgetEvents.ERROR, vkidOnError)
						.on(OneTapInternalEvents.LOGIN_SUCCESS, payload => {
							const { code, device_id } = payload

							// // Обмен кода на токен
							// Auth.exchangeCode(code, device_id)
							// 	.then(vkidOnSuccess)
							// 	.catch(vkidOnError)

							Auth.exchangeCode(code, device_id)
								.then(data => {
									console.log('Токен получен:', data)

									// Сохраняем токен в localStorage
									localStorage.setItem('vk_token', data.access_token)

									// Перенаправляем пользователя на  страницу сообщений
									window.location.href = '/message'
								})
								.catch(error => {
									console.error('Ошибка при обмене кода на токен:', error)
								})
						})
				}

				// Функция для обработки успешной авторизации
				function vkidOnSuccess(data) {
					// console.log('Успешная авторизация:', data)
					// Здесь можно отправить данные на ваш сервер для создания сессии
					// fetch('/api/auth/vk', {
					// 	method: 'POST',
					// 	headers: {
					// 		'Content-Type': 'application/json',
					// 	},
					// 	body: JSON.stringify(data),
					// })
					// 	.then(response => response.json())
					// 	.then(result => {
					// 		console.log('Ответ сервера:', result)
					// 	})
				}

				// Функция для обработки ошибок
				function vkidOnError(error) {
					console.error('Ошибка авторизации:', error)
				}
			}
		}

		document.body.appendChild(script)

		// Очистка при размонтировании компонента
		return () => {
			document.body.removeChild(script)
		}
	}, [])

	return <div ref={containerRef}></div>
}

export default VK_AUTH
