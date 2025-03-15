import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	const { code } = await request.json()

	if (!code) {
		return NextResponse.json({ error: 'Code is required' }, { status: 400 })
	}

	try {
		// Параметры из настроек приложения VK
		const CLIENT_ID = 53263292
		const CLIENT_SECRET = 'xK4loxyZGbRjhC7OjBw2'
		const REDIRECT_URI = 'https://www.unimessage.ru/vk-callback'

		// Обмен кода на токен
		const tokenResponse = await fetch(
			`https://oauth.vk.com/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIRECT_URI}&code=${code}`
		)

		const tokenData = await tokenResponse.json()

		if (tokenData.error) {
			console.error('Ошибка VK API:', tokenData.error)
			return NextResponse.json(
				{ error: tokenData.error_description },
				{ status: 500 }
			)
		}

		// Возвращаем токен клиенту
		return NextResponse.json({
			access_token: tokenData.access_token,
			expires_in: tokenData.expires_in,
			user_id: tokenData.user_id,
		})
	} catch (error) {
		console.error('Ошибка при обмене кода на токен:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
