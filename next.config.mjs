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
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://id.vk.com https://login.vk.com",
							"style-src 'self' 'unsafe-inline' https://id.vk.com",
							"connect-src 'self' https://id.vk.com https://api.vk.com https://login.vk.com",
							'frame-src https://id.vk.com https://login.vk.com https://www.unimessage.ru/vk-callback',
							"img-src 'self' data: https://*.vk.com",

							// Для Next.js
							"font-src 'self' data:",
							"manifest-src 'self'",
						].join('; '),
					},
					// CORS headers
					{
						key: 'Access-Control-Allow-Origin',
						value: [
							'https://id.vk.com',
							'https://login.vk.com',
							'https://www.unimessage.ru',
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
						value: 'Content-Type, Authorization',
					},
				],
			},
		]
	},
}

export default nextConfig
