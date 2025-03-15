// app/api/vk/conversations/route.ts
import easyvk from 'easyvk'
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
		// Инициализация easyvk
		const vk = await easyvk({
			access_token, // Передаём токен
		})

		// Выполняем запрос к VK API
		const conversations = await vk.call('messages.getConversations', {
			count: 10, // Количество диалогов
		})

		// Возвращаем данные клиенту
		return NextResponse.json(conversations)
	} catch (error) {
		console.error('Ошибка при запросе диалогов:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
