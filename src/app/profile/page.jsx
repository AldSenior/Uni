'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

export default function Profile() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const token = localStorage.getItem('vkAccessToken')

				if (!token) {
					window.location.href = '/login'
					return
				}

				const response = await axios.get(
					'https://api.vk.com/method/users.get',
					{
						params: {
							access_token: token,
							v: '5.131',
							fields: 'photo_200,first_name,last_name',
						},
					}
				)

				setUser(response.data.response[0])
			} catch (error) {
				console.error('Ошибка загрузки:', error)
				localStorage.removeItem('vkAccessToken')
				window.location.href = '/login'
			} finally {
				setLoading(false)
			}
		}

		fetchUser()
	}, [])

	if (loading) return <div>Loading...</div>

	return (
		<div>
			<h1>
				{user.first_name} {user.last_name}
			</h1>
			<img src={user.photo_200} alt='Avatar' />
			<pre>{JSON.stringify(user, null, 2)}</pre>
		</div>
	)
}
