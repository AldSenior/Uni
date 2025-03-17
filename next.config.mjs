// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					// CSP для VK ID
					{
						key: 'Content-Security-Policy',
						value: [
							// Базовые директивы
							"default-src 'self'",

							// Для VK ID SDK
							"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://id.vk.com https://vk.com",
							"style-src 'self' 'unsafe-inline' https://id.vk.com",
							"connect-src 'self' https://id.vk.com https://api.vk.com",
							'frame-src https://id.vk.com',
							"img-src 'self' data: https://*.vk.com",
						].join('; '),
					},
					// CORS headers
					{
						key: 'Access-Control-Allow-Origin',
						value: 'https://www.unimessage.ru',
					},
				],
			},
		]
	},
	// Отключаем предзагрузку шрифтов
	optimizeFonts: false,
}

export default nextConfig
