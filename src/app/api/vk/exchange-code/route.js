// app/api/vk/exchange-code/route.ts
import { NextResponse } from 'next/server'

export async function POST(request) {
	try {
		const { code } = await request.json()
		const clientId = 53263292
		const clientSecret = 'xK4loxyZGbRjhC7OjBw2'

		if (!clientId || !clientSecret) {
			return NextResponse.json(
				{ error: 'VK_CLIENT_ID или VK_CLIENT_SECRET не заданы' },
				{ status: 500 }
			)
		}
		if (!code) {
			return NextResponse.json(
				{ error: 'Authorization code is required' },
				{ status: 400 }
			)
		}

		const params = new URLSearchParams({
			client_id: 53263292,
			client_secret: 'xK4loxyZGbRjhC7OjBw2',
			redirect_uri: 'https://www.unimessage.ru/api/vk/exchange-code',
			code: code,
		})

		const vkResponse = await fetch(
			`https://oauth.vk.com/access_token?${params}`
		)
		const tokenData = await vkResponse.json()

		if (!vkResponse.ok || tokenData.error) {
			return NextResponse.json(
				{
					error: tokenData.error_description || 'VK API error',
					details: tokenData.error,
				},
				{ status: 400 }
			)
		}

		// Добавляем CORS headers
		const response = NextResponse.json({
			access_token: tokenData.access_token,
			expires_in: tokenData.expires_in,
			user_id: tokenData.user_id,
		})

		response.headers.set('Access-Control-Allow-Origin', '*')
		response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
		response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

		return response
	} catch (error) {
		console.error('Server error:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
