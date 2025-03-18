import { auth } from './app/api/auth/[...nextauth]/route'

export default auth(req => {
	if (!req.auth) {
		return Response.redirect(new URL('/login', req.url))
	}
})

export const config = {
	matcher: ['/dashboard/:path*'],
}
