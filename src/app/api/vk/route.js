import { NextResponse } from 'next/server'

export async function POST(request) {
	const { access_token } = await request.json()

	try {
		const response = await fetch(
			'https://api.vk.com/method/messages.getConversations',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					access_token,
					v: '5.131',
				}),
			}
		)

		const data = await response.text()
		return NextResponse.json(data) // Возвращаем данные клиенту
	} catch (error) {
		console.error('Ошибка при запросе диалогов:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
