// next.config.js
const securityHeaders = [
	{
		key: 'Content-Security-Policy',
		value:
			"frame-ancestors 'self' https://vk.com https://*.vk.com https://vk.ru https://*.vk.ru https://web.vk.me https://*.pages-ac.vk-apps.com;",
	},
]

module.exports = {
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: securityHeaders,
			},
		]
	},
}
