import { auth } from '../api/auth/[...nextauth]/route'

export default async function Dashboard() {
	const session = await auth()

	return (
		<div>
			<h1>Добро пожаловать, {session?.user?.name}</h1>
		</div>
	)
}
