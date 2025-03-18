'use client'
import { useRouter } from 'next/navigation'

export default function VKAuthButton() {
	const router = useRouter()

	const handleAuth = () => {
		const params = new URLSearchParams({
			client_id: 53263292,
			redirect_uri: 'https://www.unimessage.ru/api/vk/exchange-code',
			display: 'popup',
			scope: 'friends,email',
			response_type: 'code',
			v: '5.131',
		})

		router.push(`https://oauth.vk.com/authorize?${params}`)
	}

	return <button onClick={handleAuth}>Войти через VK</button>
}
