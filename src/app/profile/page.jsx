import axios from 'axios'

async function getUserData() {
	const accessToken = window.localStorage.getItem('vkAccessToken')
	if (!accessToken) {
		return
	}

	try {
		const response = await axios.get('https://api.vk.com/method/users.get', {
			params: {
				access_token: accessToken,
				v: '5.131', // Версия API VK
			},
		})
		return response.data.response[0]
	} catch (error) {
		console.error('Ошибка при получении данных пользователя:', error)
	}
}

function Profile({ user }) {
	return (
		<div>
			<h1>Добро пожаловать, {user.first_name}!</h1>
			<p>Ваш профиль:</p>
			<pre>{JSON.stringify(user, null, 2)}</pre>
		</div>
	)
}

export async function getServerSideProps() {
	const user = await getUserData()
	return { props: { user } }
}

export default Profile
