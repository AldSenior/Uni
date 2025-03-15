import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const { code } = await request.json()

		if (!code) {
			return NextResponse.json(
				{ error: 'Необходим код авторизации' },
				{ status: 400 }
			)
		}

		const params = new URLSearchParams({
			client_id: '53263292',
			client_secret: 'xK4loxyZGbRjhC7OjBw2',
			redirect_uri: 'https://www.unimessage.ru/api/vk/exchange-code',
			code: code,
		})

		const vkResponse = await fetch(
			`https://oauth.vk.com/access_token?${params}`
		)
		const tokenData = await vkResponse.json()

		if (!vkResponse.ok) {
			return NextResponse.json(
				{
					error: tokenData.error_description || 'Ошибка VK API',
					vk_error: tokenData.error,
				},
				{ status: 400 }
			)
		}

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
