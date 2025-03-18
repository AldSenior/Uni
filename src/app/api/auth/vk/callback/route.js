import axios from 'axios'
import { NextResponse } from 'next/server'

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url)
		const code = searchParams.get('code')

		// Получение токена
		const tokenResponse = await axios.get('https://oauth.vk.com/access_token', {
			params: {
				client_id: 53263292,
				client_secret: 'xK4loxyZGbRjhC7OjBw2',
				redirect_uri: 'https://www.unimessage.ru/api/vk/exchange-code',
				code,
			},
		})

		const { access_token, email, user_id } = tokenResponse.data

		// Получение данных пользователя
		const userResponse = await axios.get(
			'https://api.vk.com/method/users.get',
			{
				params: {
					user_ids: user_id,
					fields: 'photo_200,domain',
					access_token,
					v: '5.131',
				},
			}
		)

		// Здесь: сохранить пользователя в БД, создать сессию
		// Пример с Auth.js (NextAuth v5):
		// const session = await createSession({...});

		return NextResponse.redirect(new URL('/dashboard', request.url))
	} catch (error) {
		console.error('VK Auth Error:', error)
		return NextResponse.redirect(new URL('/auth/error', request.url))
	}
}
