import NextAuth from 'next-auth'
import VKProvider from 'next-auth/providers/vk'

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth({
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
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token
			}
			return token
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken
			return session
		},
	},
})
