import { setTimeout } from 'node:timers/promises'
import { Suspense } from 'react'
import Chat from './chat'

async function getTitleFromDatabase() {
  // { setTimeout } from 'node:timers/promises' allows you to call timeout
  // with a number instead of a function
  await setTimeout(1000)

  return 'Hello world!'
}

export default async function Page() {
  const title = getTitleFromDatabase()

  return (
    <div>
      <Suspense fallback={<h1>Loading...</h1>}>
        <h1>{title}</h1>
      </Suspense>

      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Chat />
      </Suspense>
    </div>
  )
}
