'use client'
import { useEffect, useState } from 'react'

const MessagesPage = () => {
	const [conversations, setConversations] = useState([])

	const fetchConversations = async () => {
		const token = localStorage.getItem('vk_token') // Получаем токен из localStorage

		if (token) {
			try {
				const response = await fetch('/api/vk/conversations', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ access_token: token }), // Передаём токен в API-роут
				})

				const data = await response.json()
				console.log('Диалоги:', data)
				return data.response.items // Возвращаем список диалогов
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
		const loadConversations = async () => {
			const data = await fetchConversations()
			setConversations(data)
		}

		loadConversations()
	}, [])
	return (
		<div>
			<h1>Мои диалоги</h1>
			<ul>
				{conversations.map(conversation => (
					<li key={conversation.conversation.peer.id}>
						<p>ID диалога: {conversation.conversation.peer.id}</p>
						<p>Последнее сообщение: {conversation.last_message.text}</p>
					</li>
				))}
			</ul>
		</div>
	)
}

export default MessagesPage
