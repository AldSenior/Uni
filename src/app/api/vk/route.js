import { NextResponse } from 'next/server'

export async function POST(request) {
	const { access_token } = await request.json()

	try {
		// Заглушка для тестирования
		const stubData = {
			response: {
				count: 2,
				items: [
					{
						conversation: {
							peer: {
								id: 123456,
								type: 'user',
							},
						},
						last_message: {
							id: 987654,
							text: 'Привет! Как дела?',
						},
					},
					{
						conversation: {
							peer: {
								id: 654321,
								type: 'chat',
							},
						},
						last_message: {
							id: 123456,
							text: 'Давайте встретимся завтра.',
						},
					},
				],
			},
		}

		// Логируем заглушку
		console.log('Используются заглушечные данные:', stubData)

		// Возвращаем заглушку вместо реальных данных
		return NextResponse.json(stubData)
	} catch (error) {
		console.error('Ошибка при запросе диалогов:', error)
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		)
	}
}
