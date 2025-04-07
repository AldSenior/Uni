// app/api/auth/[...nextauth]/route.js
import { auth, handlers, signIn, signOut } from '../../../auth'

export const { GET, POST } = handlers
export { auth, signIn, signOut }
