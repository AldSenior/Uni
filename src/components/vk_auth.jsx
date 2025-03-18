'use client'
import { VKConfig } from '@/app/config'
import { useEffect, useState } from 'react'
import VK from 'react-vk'
const AuthComponent = () => {
	const [isAuthorized, setIsAuthorized] = useState(false)
	const [userId, setUserId] = useState(null)

	useEffect(() => {
		const authorize = async () => {
			const vk = new VK({
				appId: VKConfig.appId,
				options: {
					version: VKConfig.version,
					onlyWidgets: true,
				},
			})

			const userInfo = await vk.authorize({
				scope: VKConfig.scope,
			})

			if (userInfo.status === 'connected') {
				setIsAuthorized(true)
				setUserId(userInfo.user_id)
			} else {
				console.error('Ошибка авторизации')
			}
		}

		authorize()
	}, [])

	if (isAuthorized) {
		return <div>Вы вошли как {userId}</div>
	}

	return <div>Авторизация...</div>
}

export default AuthComponent
