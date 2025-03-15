import { useEffect, useState } from 'react'

const MessagesPage = () => {
	const [conversations, setConversations] = useState([])
	const [selectedPeerId, setSelectedPeerId] = useState(null)
	const [messages, setMessages] = useState([])

	const fetchConversations = async () => {
		const token = localStorage.getItem('vk_token') // Получаем токен из localStorage

		if (token) {
			try {
				// Выполняем запрос к VK API
				const response = await fetch(
					'https://api.vk.com/method/messages.getConversations',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							access_token: token, // Токен пользователя
							v: '5.131', // Версия API
						}),
					}
				)

				const data = await response.json() // Парсим ответ
				console.log('Диалоги:', data)

				if (data.response) {
					return data.response.items // Возвращаем список диалогов
				} else {
					console.error('Ошибка в ответе VK API:', data)
					return []
				}
			} catch (error) {
				console.error('Ошибка при запросе диалогов:', error)
				return []
			}
		} else {
			console.log('Токен не найден')
			return []
		}
	}
	useEffect(() => {
		fetchConversations().then(data => setConversations(data || []))
	}, [])

	useEffect(() => {
		if (selectedPeerId) {
			fetchMessageHistory(selectedPeerId).then(data => setMessages(data || []))
		}
	}, [selectedPeerId])

	return (
		<div>
			<h1>Мои сообщения</h1>
			<div>
				<h2>Диалоги</h2>
				<ul>
					{conversations.map(conversation => (
						<li key={conversation.conversation.peer.id}>
							<button
								onClick={() =>
									setSelectedPeerId(conversation.conversation.peer.id)
								}
							>
								Открыть диалог
							</button>
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2>Сообщения</h2>
				<ul>
					{messages.map(message => (
						<li key={message.id}>{message.text}</li>
					))}
				</ul>
			</div>
		</div>
	)
}

export default MessagesPage
