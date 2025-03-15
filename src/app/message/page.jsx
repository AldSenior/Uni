'use client'
import { useEffect, useState } from 'react'

const MessagesPage = () => {
	const [conversations, setConversations] = useState([])

	const fetchConversations = async () => {
		const token = localStorage.getItem('vk_token')
		if (!token) return

		try {
			const response = await fetch('/api/vk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ access_token: token }),
			})

			const data = await response.json()
			setConversations(data)
		} catch (error) {
			console.error('Ошибка:', error)
		}
	}

	useEffect(() => {
		fetchConversations()
	}, [])

	return (
		<div>
			<h1>Мои диалоги</h1>
			<ul>
				{conversations.map((msg, i) => (
					<li key={i}>
						<p>
							<strong>{msg.from}</strong> ({msg.date})
						</p>
						<p>
							{msg.text} {msg.attachments}
						</p>
					</li>
				))}
			</ul>
		</div>
	)
}

export default MessagesPage
