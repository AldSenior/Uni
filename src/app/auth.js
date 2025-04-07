// auth.js в корне проекта
import NextAuth from 'next-auth'
import VKProvider from 'next-auth/providers/vk'

export const authOptions = {
	providers: [
		VKProvider({
			clientId: 53263292,
			clientSecret: 'xK4loxyZGbRjhC7OjBw2',
			authorization: {
				params: {
					scope: 'email',
					display: 'popup',
					v: '5.131',
				},
			},
		}),
	],
	secret: 'xK4loxyZGbRjhC7OjBw2',
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async session({ session, token }) {
			session.accessToken = token.accessToken
			return session
		},
	},
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
