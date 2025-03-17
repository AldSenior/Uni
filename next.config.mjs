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
							"connect-src 'self' https://id.vk.com https://api.vk.com https://login.vk.com https://vk.com",
							'frame-src https://id.vk.com https://login.vk.com https://vk.com https://www.unimessage.ru',
							"frame-ancestors 'self' https://id.vk.com https://*.vk.com https://vk.ru",
							"img-src 'self' data: https://*.vk.com https://*.userapi.com",

							// Для Next.js и шрифтов
							"font-src 'self' data:",
							"manifest-src 'self'",

							// Защита от сторонних скриптов
							"script-src-elem 'self' https://id.vk.com https://login.vk.com",
						].join('; '),
					},
					{
						key: 'Access-Control-Allow-Origin',
						value: [
							'https://id.vk.com',
							'https://login.vk.com',
							'https://vk.com',
							'https://www.unimessage.ru',
							process.env.NODE_ENV === 'development' && 'http://localhost:3000',
						]
							.filter(Boolean)
							.join(' '),
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
	experimental: {
		serverActions: {
			allowedOrigins: [
				'id.vk.com',
				'login.vk.com',
				'vk.com',
				'www.unimessage.ru',
				'localhost:3000',
			],
		},
	},
}

export default nextConfig
