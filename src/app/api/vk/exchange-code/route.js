// app/api/vk/exchange-code/route.ts
import { NextResponse } from 'next/server'

export async function POST(request) {
	try {
		const { code } = await request.json()

		if (!code) {
			return NextResponse.json(
				{ error: 'Authorization code is required' },
				{ status: 400 }
			)
		}

		const params = new URLSearchParams({
			client_id: process.env.VK_CLIENT_ID,
			client_secret: process.env.VK_CLIENT_SECRET,
			redirect_uri: process.env.VK_REDIRECT_URI,
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
