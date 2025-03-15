import { NextResponse } from 'next/server'

export async function POST(request) {
	const { code, device_id } = await request.json()

	if (!code || !device_id) {
		return NextResponse.json(
			{ error: 'Code and device_id are required' },
			{ status: 400 }
		)
	}

	try {
		// Обмен кода на токен
		const tokenResponse = await fetch(
			`https://oauth.vk.com/access_token?client_id=53263292&client_secret=xK4loxyZGbRjhC7OjBw2&redirect_uri=https://www.unimessage.ru/vk-callback&code=${code}`,
			{
				method: 'GET',
			}
		)

		const tokenData = await tokenResponse.json()

		if (tokenData.error) {
			console.error('Ошибка при обмене кода на токен:', tokenData.error)
			return NextResponse.json(
				{ error: tokenData.error_description },
				{ status: 500 }
			)
		}

		// Возвращаем токен клиенту
		return NextResponse.json({
			access_token: tokenData.access_token,
		})
	} catch (error) {
		console.error('Ошибка при обмене кода на токен:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
