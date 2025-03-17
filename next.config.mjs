/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Content-Security-Policy',
						value: [
							// Базовые директивы
							"default-src 'self'",

							// Для VK ID SDK
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://id.vk.com https://login.vk.com https://vk.com",
							"style-src 'self' 'unsafe-inline' https://id.vk.com https://vk.com",
							"connect-src 'self' https://id.vk.com https://api.vk.com https://login.vk.com",
							'frame-src https://id.vk.com https://login.vk.com https://www.unimessage.ru/vk-callback',
							"frame-ancestors 'self' https://vk.com https://*.vk.com https://vk.ru https://*.vk.ru https://web.vk.me",
							"img-src 'self' data: https://*.vk.com https://*.vk-user-content.com",

							// Для шрифтов
							"font-src 'self' data:",

							// Дополнительные настройки
							"manifest-src 'self'",
							"form-action 'self'",
						].join('; '),
					},
					// CORS headers (для вашего сервера)
					{
						key: 'Access-Control-Allow-Origin',
						value: 'https://www.unimessage.ru',
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET, POST, PUT, DELETE, OPTIONS',
					},
					{
						key: 'Access-Control-Allow-Headers',
						value: 'Content-Type, Authorization, X-Requested-With',
					},
					{
						key: 'Access-Control-Allow-Credentials',
						value: 'true',
					},
				],
			},
		]
	},
}

export default nextConfig
