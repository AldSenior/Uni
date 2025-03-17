/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					// Решаем проблему CORS для VK API
					{
						key: 'Access-Control-Allow-Origin',
						value: 'https://id.vk.com https://www.unimessage.ru',
					},
					{
						key: 'Access-Control-Allow-Methods',
						value: 'GET,POST,PUT,DELETE,OPTIONS',
					},
					{
						key: 'Access-Control-Allow-Headers',
						value: 'Content-Type, Authorization',
					},

					// Исправляем CSP ошибки
					{
						key: 'Content-Security-Policy',
						value: [
							"default-src 'self'",
							"connect-src 'self' https://id.vk.com https://api.vk.com",
							'frame-src https://id.vk.com',
							"frame-ancestors 'self' https://vk.com https://*.vk.com https://vk.ru",
							"font-src 'self' data:",
						].join('; '),
					},
				],
			},
		]
	},

	// Решаем проблему с предзагрузкой шрифтов
	optimizeFonts: false,
}

export default nextConfig
