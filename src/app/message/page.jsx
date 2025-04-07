'use client'
import { useEffect, useState } from 'react'

const MessagesPage = () => {
	const [conversations, setConversations] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const fetchConversations = async () => {
		try {
			const token = localStorage.getItem('vk_token')
			if (!token) throw new Error('Токен не найден')

			const response = await fetch('/api/vk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ access_token: token }),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error)
			}

			const data = await response.json()
			setConversations(data)
		} catch (error) {
			console.error('Ошибка:', error)
			setError(error.message)
			if (error.message.includes('Токен')) {
				window.location.href = '/'
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchConversations()
	}, [])

	if (loading) return <div>Загрузка диалогов...</div>
	if (error) return <div>Ошибка: {error}</div>

	return (
		<div className='container'>
			<h1>Мои диалоги</h1>
			<div className='conversations-list'>
				{conversations.map((conv, index) => (
					<div key={index} className='conversation-item'>
						<h3>{conv.conversation.title}</h3>
						<p>Последнее сообщение: {conv.last_message.text}</p>
						<p>
							Дата: {new Date(conv.last_message.date * 1000).toLocaleString()}
						</p>
					</div>
				))}
			</div>
		</div>
	)
}

export default MessagesPage
