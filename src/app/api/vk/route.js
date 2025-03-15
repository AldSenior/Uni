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
		// Запрос к VK API (используем GET!)
		const response = await fetch(
			`https://api.vk.com/method/messages.getConversations?access_token=${access_token}&v=5.131`
		)

		const data = await response.json()

		if (data.error) {
			console.error('Ошибка VK API:', data.error)
			return NextResponse.json({ error: data.error.error_msg }, { status: 500 })
		}

		// Обработка данных
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
