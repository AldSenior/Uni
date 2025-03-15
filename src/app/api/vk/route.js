// app/api/vk/conversations/route.ts
import { NextResponse } from 'next/server'

export async function POST(request) {
	const { access_token } = await request.json()

	if (!access_token) {
		return NextResponse.json(
			{ error: 'Access token is missing' },
			{ status: 400 }
		)
	}

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
					count: 20,
					extended: 1,
				}),
			}
		)

		const rawResponse = await response.text() // Логируем сырой ответ
		console.log('Raw response:', rawResponse)

		const data = JSON.parse(rawResponse)

		if (data.error) {
			// Обрабатываем ошибку от VK API
			console.error('Ошибка VK API:', data.error)
			return NextResponse.json({ error: data.error.error_msg }, { status: 500 })
		}

		if (!data.response) {
			console.error('Ошибка VK API: response отсутствует')
			return NextResponse.json(
				{ error: 'Invalid response from VK API' },
				{ status: 500 }
			)
		}

		// Обрабатываем сообщения
		const messages = data.response.items.map(item => {
			const message = item.last_message
			const user = data.response.profiles.find(p => p.id === message.from_id)

			return {
				date: new Date(message.date * 1000).toLocaleString(),
				from: user
					? `${user.first_name} ${user.last_name}`
					: `ID${message.from_id}`,
				text: message.text,
				attachments: message.attachments
					? `[${message.attachments.length} вложений]`
					: '',
			}
		})

		return NextResponse.json(messages)
	} catch (error) {
		console.error('Ошибка при запросе диалогов:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
