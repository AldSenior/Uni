'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthHandler({ children }) {
	const router = useRouter()

	useEffect(() => {
		const handleMessage = event => {
			// Проверяем origin для безопасности
			if (event.origin !== window.location.origin) return

			if (event.data.type === 'vk-auth-success') {
				localStorage.setItem('vkAccessToken', event.data.token)
				localStorage.setItem('vkUserId', event.data.userId)
				router.push('/profile')
			}
		}

		window.addEventListener('message', handleMessage)
		return () => window.removeEventListener('message', handleMessage)
	}, [router])

	return <>{children}</>
}
