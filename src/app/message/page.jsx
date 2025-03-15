'use client'
import { useEffect, useState } from 'react'

const MessagesPage = () => {
	const [conversations, setConversations] = useState([])
	const fetchConversations = async () => {
		const token = localStorage.getItem('vk_token')
		console.log(token)

		if (token) {
			try {
				const response = await fetch('/api/vk', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ access_token: token }),
				})

				const data = await response.json()
				console.log('Диалоги:', data)
				return data // Возвращаем список сообщений
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
	console.log(conversations)

	return (
		<div>
			<h1>Мои диалоги</h1>
			<ul>
				{/* {messages.map((msg, i) => (
					<li key={i}>
						<p>
							<strong>{msg.from}</strong> ({msg.date})
						</p>
						<p>
							{msg.text} {msg.attachments}
						</p>
					</li> */}
				{/* ))} */}
			</ul>
		</div>
	)
}

export default MessagesPage
