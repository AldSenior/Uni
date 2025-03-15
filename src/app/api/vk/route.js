export default async function handler(req, res) {
	const { access_token } = req.body

	try {
		const response = await fetch(
			'https://api.vk.com/method/messages.getConversations',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					access_token,
					v: '5.131',
				}),
			}
		)

		const data = await response.json()
		res.status(200).json(data) // Возвращаем данные клиенту
	} catch (error) {
		console.error('Ошибка при запросе диалогов:', error)
		res.status(500).json({ error: 'Internal Server Error' })
	}
}
