// app/api/vk/conversations/route.ts
import { NextResponse } from 'next/server'

export async function POST(request) {
	const { access_token } = await request.json() // Получаем токен из тела запроса

	if (!access_token) {
		return NextResponse.json(
			{ error: 'Access token is missing' },
			{ status: 400 }
		)
	}

	try {
		// Выполняем запрос к VK API
		const response = await fetch(
			'https://api.vk.com/method/messages.getConversations',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					access_token, // Передаём токен
					v: '5.131',
					count: 20, // Количество диалогов
					extended: 1, // Чтобы получить информацию о пользователях
				}),
			}
		)

		const data = await response.json()

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

		// Возвращаем данные клиенту
		return NextResponse.json(messages)
	} catch (error) {
		console.error('Ошибка при запросе диалогов:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
