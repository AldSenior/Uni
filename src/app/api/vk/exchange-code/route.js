import { NextResponse } from 'next/server'

export async function POST(request) {
	try {
		const { code, device_id } = await request.json()

		if (!code || !device_id) {
			return NextResponse.json(
				{ error: 'Необходимы код авторизации и device_id' },
				{ status: 400 }
			)
		}

		const params = new URLSearchParams({
			client_id: 53263292,
			client_secret: 'xK4loxyZGbRjhC7OjBw2',
			redirect_uri: `https://www.unimessage.ru/api/vk/exchange-code`,
			code: code,
			device_id: device_id,
		})

		const vkResponse = await fetch(
			`https://oauth.vk.com/access_token?${params}`
		)

		const tokenData = await vkResponse.json()

		if (!vkResponse.ok || tokenData.error) {
			console.error('VK API Error:', tokenData)
			return NextResponse.json(
				{
					error: tokenData.error_description || 'Ошибка авторизации VK',
					code: tokenData.error,
				},
				{ status: 400 }
			)
		}

		console.log('Успешная авторизация для user:', tokenData.user_id)

		return NextResponse.json({
			access_token: tokenData.access_token,
			expires_in: tokenData.expires_in,
			user_id: tokenData.user_id,
		})
	} catch (error) {
		console.error('Internal Server Error:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
