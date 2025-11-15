'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export default function Chat() {
	const [input, setInput] = useState('')
	const { messages, sendMessage } = useChat()
	return (
		<div className="p-4">
			<div className="mb-4 space-y-2">
				{messages.map((m) => (
					<div
						key={m.id}
						className={m.role === 'user' ? 'text-blue-600' : 'text-gray-800'}
					>
						<strong>{m.role}:</strong>{' '}
						{m.parts.find((p) => p.type === 'text')?.text}
					</div>
				))}
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					if (input.trim()) {
						sendMessage({ text: input })
						setInput('')
					}
				}}
			>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Say something..."
					className="border p-2 w-full"
				/>
				<button
					type="submit"
					className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
				>
					Send
				</button>
			</form>
		</div>
	)
}
