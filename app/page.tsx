import { Suspense } from 'react'
import Chat from './chat'

export default function Page() {
	return (
		<Suspense fallback={<div className="p-4">Loading...</div>}>
			<Chat />
		</Suspense>
	)
}
