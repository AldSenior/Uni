import { NextResponse } from 'next/server'

export async function POST(request) {
	try {
		const { access_token } = await request.json()

		if (!access_token) {
			return NextResponse.json(
				{ error: 'Токен доступа отсутствует' },
				{ status: 401 }
			)
		}

		const response = await fetch(
			`https://api.vk.com/method/messages.getConversations?` +
				new URLSearchParams({
					access_token: access_token,
					v: '5.199',
					count: 20,
					extended: 1,
				})
		)

		const data = await response.json()

		if (data.error) {
			console.error('VK API Error:', data.error)
			return NextResponse.json({ error: data.error.error_msg }, { status: 400 })
		}

		return NextResponse.json(data.response.items)
	} catch (error) {
		console.error('Internal Server Error:', error)
		return NextResponse.json(
			{ error: 'Ошибка при получении диалогов' },
			{ status: 500 }
		)
	}
}
