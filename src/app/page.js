import { SocialAuth } from 'react-social-auth'

const Index = () => (
	<div>
		<SocialAuth
			providers={['vk']}
			onSuccess={profile => {
				window.localStorage.setItem('vkAccessToken', profile.access_token)
				window.location.href = '/profile'
			}}
		>
			<button>Войти через VK</button>
		</SocialAuth>
	</div>
)

export default Index
